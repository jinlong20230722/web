// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { getRecords, createRecord, updateRecord, deleteRecord, formatDateTime } from '@/lib/dataSource';
export default function Feedback(props) {
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({
    submitterName: '',
    submitterId: '',
    feedbackType: '建议',
    content: ''
  });

  // 加载反馈数据
  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const result = await getRecords('feedback', {}, 100, 1, [{
        submitTime: 'desc'
      }]);
      if (result && result.records) {
        setFeedbacks(result.records);
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载反馈数据失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadFeedbacks();
  }, []);
  const columns = [{
    key: '_id',
    label: 'ID'
  }, {
    key: 'submitterName',
    label: '反馈人'
  }, {
    key: 'submitterId',
    label: '反馈人ID'
  }, {
    key: 'feedbackType',
    label: '反馈类型'
  }, {
    key: 'content',
    label: '反馈内容'
  }, {
    key: 'submitTime',
    label: '提交时间',
    render: value => formatDateTime(value)
  }, {
    key: 'processStatus',
    label: '状态',
    render: value => <span className={`px-2 py-1 rounded-full text-xs ${value === '已处理' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {value === '已处理' ? '已处理' : '待处理'}
        </span>
  }];
  const filterOptions = [{
    value: 'all',
    label: '全部状态'
  }, {
    value: 'pending',
    label: '待处理'
  }, {
    value: 'processed',
    label: '已处理'
  }];
  const filteredData = feedbacks.filter(item => {
    const matchesSearch = item.submitterName?.toLowerCase().includes(searchTerm.toLowerCase()) || item.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === 'pending' && item.processStatus === '待处理' || filterStatus === 'processed' && item.processStatus === '已处理';
    return matchesSearch && matchesFilter;
  });
  const handleAdd = () => {
    setFormData({
      submitterName: '',
      submitterId: '',
      feedbackType: '建议',
      content: ''
    });
    setIsDialogOpen(true);
  };
  const handleReply = item => {
    setSelectedFeedback(item);
    setReplyText('');
    setIsReplyDialogOpen(true);
  };
  const handleDelete = async item => {
    if (confirm('确定要删除该反馈吗？')) {
      try {
        await deleteRecord('feedback', {
          $and: [{
            _id: {
              $eq: item._id
            }
          }]
        });
        toast({
          title: '删除成功',
          description: '反馈已删除'
        });
        loadFeedbacks();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除反馈失败',
          variant: 'destructive'
        });
      }
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const data = {
        submitterName: formData.submitterName,
        submitterId: formData.submitterId,
        feedbackType: formData.feedbackType,
        content: formData.content,
        processStatus: '待处理'
      };
      await createRecord('feedback', data);
      toast({
        title: '提交成功',
        description: '反馈已提交'
      });
      setIsDialogOpen(false);
      loadFeedbacks();
    } catch (error) {
      toast({
        title: '提交失败',
        description: error.message || '提交反馈失败',
        variant: 'destructive'
      });
    }
  };
  const handleReplySubmit = async e => {
    e.preventDefault();
    try {
      await updateRecord('feedback', {
        processStatus: '已处理'
      }, {
        $and: [{
          _id: {
            $eq: selectedFeedback._id
          }
        }]
      });
      toast({
        title: '回复成功',
        description: '反馈已标记为已处理'
      });
      setIsReplyDialogOpen(false);
      loadFeedbacks();
    } catch (error) {
      toast({
        title: '回复失败',
        description: error.message || '回复失败',
        variant: 'destructive'
      });
    }
  };
  return <PageLayout currentPage="feedback" onPageChange={pageId => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {}
    });
  }} title="意见反馈管理" subtitle="查看和回复用户反馈" user={props.$w?.auth?.currentUser}>
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          + 提交反馈
        </Button>
      </div>

      <DataTable columns={columns} data={filteredData} onReply={handleReply} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>提交反馈</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="submitterName">反馈人 *</Label>
                  <Input id="submitterName" value={formData.submitterName} onChange={e => setFormData({
                  ...formData,
                  submitterName: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submitterId">反馈人ID *</Label>
                  <Input id="submitterId" value={formData.submitterId} onChange={e => setFormData({
                  ...formData,
                  submitterId: e.target.value
                })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedbackType">反馈类型 *</Label>
                <Select value={formData.feedbackType} onValueChange={value => setFormData({
                ...formData,
                feedbackType: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="建议">建议</SelectItem>
                    <SelectItem value="投诉">投诉</SelectItem>
                    <SelectItem value="表扬">表扬</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">反馈内容 *</Label>
                <Textarea id="content" value={formData.content} onChange={e => setFormData({
                ...formData,
                content: e.target.value
              })} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                提交反馈
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>回复反馈</DialogTitle>
          </DialogHeader>
          {selectedFeedback && <div className="space-y-4">
              <div>
                <Label className="text-gray-600">反馈人</Label>
                <p className="font-medium">{selectedFeedback.submitterName}</p>
              </div>
              <div>
                <Label className="text-gray-600">反馈类型</Label>
                <p className="font-medium">{selectedFeedback.feedbackType}</p>
              </div>
              <div>
                <Label className="text-gray-600">反馈内容</Label>
                <p className="font-medium">{selectedFeedback.content}</p>
              </div>
              <div>
                <Label className="text-gray-600">提交时间</Label>
                <p className="font-medium">{formatDateTime(selectedFeedback.submitTime)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply">回复内容</Label>
                <Textarea id="reply" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="请输入回复内容..." />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                  取消
                </Button>
                <Button type="button" onClick={handleReplySubmit} className="bg-blue-600 hover:bg-blue-700">
                  标记为已处理
                </Button>
              </DialogFooter>
            </div>}
        </DialogContent>
      </Dialog>
    </PageLayout>;
}