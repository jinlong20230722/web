// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Download } from 'lucide-react';

import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { StatisticsChart } from '@/components/StatisticsChart';
import { StatCard } from '@/components/StatCard';
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

  // 统计数据
  const statusStats = feedbacks.reduce((acc, item) => {
    const status = item.processStatus || '待处理';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusChartData = Object.entries(statusStats).map(([name, value]) => ({
    name,
    value
  }));

  // 按反馈类型统计
  const typeStats = feedbacks.reduce((acc, item) => {
    const type = item.feedbackType || '未知';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const typeChartData = Object.entries(typeStats).map(([name, value]) => ({
    name,
    value
  }));

  // 导出 CSV
  const handleExportCSV = () => {
    const headers = ['ID', '反馈人', '反馈人ID', '反馈类型', '反馈内容', '提交时间', '状态'];
    const csvContent = [headers.join(','), ...filteredData.map(item => [item._id || '', item.submitterName || '', item.submitterId || '', item.feedbackType || '', item.content || '', formatDateTime(item.submitTime) || '', item.processStatus || ''].join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `反馈记录_${new Date().toLocaleDateString('zh-CN')}.csv`;
    link.click();
    toast({
      title: '导出成功',
      description: '反馈记录已导出为 CSV 文件'
    });
  };
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
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="总反馈数" value={feedbacks.length} color="#3B82F6" />
        <StatCard title="待处理" value={feedbacks.filter(f => f.processStatus === '待处理').length} color="#F59E0B" />
        <StatCard title="已处理" value={feedbacks.filter(f => f.processStatus === '已处理').length} color="#10B981" />
        <StatCard title="处理率" value={`${feedbacks.length > 0 ? Math.round(feedbacks.filter(f => f.processStatus === '已处理').length / feedbacks.length * 100) : 0}%`} color="#8B5CF6" />
      </div>

      {/* 统计图表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatisticsChart title="处理状态" data={statusChartData} dataKey="value" nameKey="name" type="pie" color="#3B82F6" />
        <StatisticsChart title="反馈类型" data={typeChartData} dataKey="value" nameKey="name" type="bar" color="#10B981" />
      </div>

      {/* 操作栏 */}
      <div className="flex justify-end mb-4">
        <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2" size={16} />
          导出 CSV
        </Button>
      </div>

      <DataTable columns={columns} data={filteredData} onAdd={handleAdd} onReply={handleReply} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw]">
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
        <DialogContent className="sm:max-w-[500px] w-[95vw]">
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