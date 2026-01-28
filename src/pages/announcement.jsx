// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
export default function Announcement(props) {
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'notice',
    content: '',
    priority: 'normal'
  });

  // 加载公告列表
  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'announcement',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {}
          },
          select: {
            $master: true
          },
          orderBy: [{
            publishTime: 'desc'
          }],
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        setAnnouncements(result.records);
      }
    } catch (error) {
      console.error('加载公告失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '加载公告列表失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadAnnouncements();
  }, []);
  const columns = [{
    key: '_id',
    label: 'ID'
  }, {
    key: 'title',
    label: '公告标题'
  }, {
    key: 'type',
    label: '公告类型',
    render: value => {
      const typeMap = {
        notice: '通知',
        training: '培训',
        commendation: '表彰'
      };
      return typeMap[value] || value;
    }
  }, {
    key: 'publishTime',
    label: '发布时间'
  }, {
    key: 'publisher',
    label: '发布人'
  }, {
    key: 'priority',
    label: '优先级',
    render: value => <span className={`px-2 py-1 rounded-full text-xs ${value === 'high' ? 'bg-red-50 text-red-800' : 'bg-blue-100 text-blue-700'}`}>
          {value === 'high' ? '高' : '普通'}
        </span>
  }];
  const typeOptions = [{
    value: 'all',
    label: '全部类型'
  }, {
    value: 'notice',
    label: '通知'
  }, {
    value: 'training',
    label: '培训'
  }, {
    value: 'commendation',
    label: '表彰'
  }];
  const filteredData = announcements.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });
  const handleAdd = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      type: 'notice',
      content: '',
      priority: 'normal'
    });
    setIsDialogOpen(true);
  };
  const handleEdit = item => {
    setEditingAnnouncement(item);
    setFormData({
      title: item.title,
      type: item.type,
      content: item.content,
      priority: item.priority
    });
    setIsDialogOpen(true);
  };
  const handleView = item => {
    setSelectedAnnouncement(item);
    setIsViewDialogOpen(true);
  };
  const handleDelete = async item => {
    if (confirm('确定要删除该公告吗？')) {
      try {
        const result = await props.$w.cloud.callDataSource({
          dataSourceName: 'announcement',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                $and: [{
                  _id: {
                    $eq: item._id
                  }
                }]
              }
            }
          }
        });
        if (result && result.count > 0) {
          toast({
            title: '删除成功',
            description: '公告已删除'
          });
          loadAnnouncements();
        } else {
          toast({
            title: '删除失败',
            description: '未找到要删除的公告',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('删除公告失败:', error);
        toast({
          title: '删除失败',
          description: error.message || '删除公告时发生错误',
          variant: 'destructive'
        });
      }
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const currentUser = props.$w?.auth?.currentUser;
      const publisher = currentUser?.name || currentUser?.nickName || '管理员';
      const publishTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      if (editingAnnouncement) {
        // 更新公告
        const result = await props.$w.cloud.callDataSource({
          dataSourceName: 'announcement',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              title: formData.title,
              type: formData.type,
              content: formData.content,
              priority: formData.priority
            },
            filter: {
              where: {
                $and: [{
                  _id: {
                    $eq: editingAnnouncement._id
                  }
                }]
              }
            }
          }
        });
        if (result && result.count > 0) {
          toast({
            title: '更新成功',
            description: '公告已更新'
          });
          loadAnnouncements();
        } else {
          toast({
            title: '更新失败',
            description: '未找到要更新的公告',
            variant: 'destructive'
          });
        }
      } else {
        // 新增公告
        const result = await props.$w.cloud.callDataSource({
          dataSourceName: 'announcement',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              title: formData.title,
              type: formData.type,
              content: formData.content,
              priority: formData.priority,
              publishTime: publishTime,
              publisher: publisher
            }
          }
        });
        if (result && result.id) {
          toast({
            title: '发布成功',
            description: '公告已发布'
          });
          loadAnnouncements();
        } else {
          toast({
            title: '发布失败',
            description: '发布公告时发生错误',
            variant: 'destructive'
          });
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('提交失败:', error);
      toast({
        title: editingAnnouncement ? '更新失败' : '发布失败',
        description: error.message || '操作时发生错误',
        variant: 'destructive'
      });
    }
  };
  return <PageLayout currentPage="announcement" onPageChange={pageId => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {}
    });
  }} title="公告信息管理" subtitle="发布和管理公告" user={props.$w?.auth?.currentUser}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">公告列表</h2>
          <p className="text-gray-600 mt-1">共 {announcements.length} 条公告</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          + 发布公告
        </Button>
      </div>

      <DataTable columns={columns} data={filteredData} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={typeOptions} filterValue={filterType} setFilterValue={setFilterType} loading={loading} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? '编辑公告' : '发布公告'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">公告标题 *</Label>
                <Input id="title" value={formData.title} onChange={e => setFormData({
                ...formData,
                title: e.target.value
              })} required placeholder="请输入公告标题" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">公告类型 *</Label>
                  <Select value={formData.type} onValueChange={value => setFormData({
                  ...formData,
                  type: value
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notice">通知</SelectItem>
                      <SelectItem value="training">培训</SelectItem>
                      <SelectItem value="commendation">表彰</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">优先级</Label>
                  <Select value={formData.priority} onValueChange={value => setFormData({
                  ...formData,
                  priority: value
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">普通</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">公告内容 *</Label>
                <Textarea id="content" value={formData.content} onChange={e => setFormData({
                ...formData,
                content: e.target.value
              })} required placeholder="请输入公告内容" rows={6} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingAnnouncement ? '更新' : '发布'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>公告详情</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && <div className="space-y-4">
              <div>
                <Label className="text-gray-600">公告标题</Label>
                <p className="font-medium text-lg">{selectedAnnouncement.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">公告类型</Label>
                  <p className="font-medium">
                    {selectedAnnouncement.type === 'notice' ? '通知' : selectedAnnouncement.type === 'training' ? '培训' : '表彰'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">优先级</Label>
                  <p className={`font-medium px-2 py-1 rounded-full text-xs inline-block ${selectedAnnouncement.priority === 'high' ? 'bg-red-50 text-red-800' : 'bg-blue-100 text-blue-700'}`}>
                    {selectedAnnouncement.priority === 'high' ? '高' : '普通'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">发布时间</Label>
                  <p className="font-medium">{selectedAnnouncement.publishTime}</p>
                </div>
                <div>
                  <Label className="text-gray-600">发布人</Label>
                  <p className="font-medium">{selectedAnnouncement.publisher}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">公告内容</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </PageLayout>;
}