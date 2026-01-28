// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Download } from 'lucide-react';

import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { StatisticsChart } from '@/components/StatisticsChart';
import { StatCard } from '@/components/StatCard';
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
  const [showWarning, setShowWarning] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    type: 'notice',
    content: '',
    priority: 'normal'
  });

  // 模拟公告数据（announcement 数据模型不存在，使用模拟数据）
  const [announcements, setAnnouncements] = useState([{
    id: 1,
    title: '关于加强春节期间安全工作的通知',
    type: 'notice',
    content: '为确保春节期间的安全稳定，请各部门加强值班巡逻，做好应急准备。',
    priority: 'high',
    publishTime: '2026-01-27 08:00',
    publisher: '管理员'
  }, {
    id: 2,
    title: '关于开展消防安全培训的通知',
    type: 'training',
    content: '定于2026年2月1日开展消防安全培训，请全体保安人员准时参加。',
    priority: 'normal',
    publishTime: '2026-01-26 10:00',
    publisher: '管理员'
  }, {
    id: 3,
    title: '关于调整巡逻路线的通知',
    type: 'notice',
    content: '根据实际需要，从即日起调整各区域巡逻路线，具体安排详见附件。',
    priority: 'normal',
    publishTime: '2026-01-25 14:30',
    publisher: '管理员'
  }, {
    id: 4,
    title: '关于表彰优秀保安人员的决定',
    type: 'commendation',
    content: '为表彰先进，树立典型，决定对张三、李四等10名优秀保安人员予以表彰。',
    priority: 'normal',
    publishTime: '2026-01-24 09:00',
    publisher: '管理员'
  }, {
    id: 5,
    title: '关于规范着装要求的通知',
    type: 'notice',
    content: '请全体保安人员严格按照规定着装，保持良好形象。',
    priority: 'high',
    publishTime: '2026-01-23 16:00',
    publisher: '管理员'
  }]);
  const columns = [{
    key: 'id',
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

  // 统计数据
  const typeStats = announcements.reduce((acc, item) => {
    const typeMap = {
      notice: '通知',
      training: '培训',
      commendation: '表彰'
    };
    const type = typeMap[item.type] || item.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const typeChartData = Object.entries(typeStats).map(([name, value]) => ({
    name,
    value
  }));

  // 按优先级统计
  const priorityStats = announcements.reduce((acc, item) => {
    const priority = item.priority === 'high' ? '高优先级' : '普通优先级';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});
  const priorityChartData = Object.entries(priorityStats).map(([name, value]) => ({
    name,
    value
  }));

  // 导出 CSV
  const handleExportCSV = () => {
    const headers = ['ID', '公告标题', '公告类型', '发布时间', '发布人', '优先级'];
    const csvContent = [headers.join(','), ...filteredData.map(item => [item.id || '', item.title || '', item.type || '', item.publishTime || '', item.publisher || '', item.priority || ''].join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `公告记录_${new Date().toLocaleDateString('zh-CN')}.csv`;
    link.click();
    toast({
      title: '导出成功',
      description: '公告记录已导出为 CSV 文件'
    });
  };
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
  const handleDelete = item => {
    if (confirm('确定要删除该公告吗？')) {
      setAnnouncements(announcements.filter(a => a.id !== item.id));
      toast({
        title: '删除成功',
        description: '公告已删除'
      });
    }
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (editingAnnouncement) {
      setAnnouncements(announcements.map(a => a.id === editingAnnouncement.id ? {
        ...a,
        title: formData.title,
        type: formData.type,
        content: formData.content,
        priority: formData.priority
      } : a));
      toast({
        title: '更新成功',
        description: '公告已更新'
      });
    } else {
      const newAnnouncement = {
        id: Date.now(),
        title: formData.title,
        type: formData.type,
        content: formData.content,
        priority: formData.priority,
        publishTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        publisher: '管理员'
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      toast({
        title: '发布成功',
        description: '公告已发布'
      });
    }
    setIsDialogOpen(false);
  };
  return <PageLayout currentPage="announcement" onPageChange={pageId => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {}
    });
  }} title="公告信息管理" subtitle="发布和管理公告" user={props.$w?.auth?.currentUser}>
      {/* 警告提示 */}
      {showWarning && <div className="mb-4 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
          <span className="text-orange-600">⚠️</span>
          <p className="text-sm text-orange-700 flex-1">announcement 数据模型不存在，当前使用模拟数据</p>
          <button onClick={() => setShowWarning(false)} className="text-orange-600 hover:text-orange-800 transition-colors" title="关闭提示">
            ✕
          </button>
        </div>}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="总公告数" value={announcements.length} color="#3B82F6" />
        <StatCard title="通知" value={announcements.filter(a => a.type === 'notice').length} color="#10B981" />
        <StatCard title="培训" value={announcements.filter(a => a.type === 'training').length} color="#F59E0B" />
        <StatCard title="表彰" value={announcements.filter(a => a.type === 'commendation').length} color="#8B5CF6" />
      </div>

      {/* 统计图表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatisticsChart title="公告类型" data={typeChartData} dataKey="value" nameKey="name" type="pie" color="#3B82F6" />
        <StatisticsChart title="优先级分布" data={priorityChartData} dataKey="value" nameKey="name" type="bar" color="#10B981" />
      </div>

      {/* 操作栏 */}
      <div className="flex justify-end mb-4">
        <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2" size={16} />
          导出 CSV
        </Button>
      </div>

      <DataTable columns={columns} data={filteredData} onAdd={handleAdd} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={typeOptions} filterValue={filterType} setFilterValue={setFilterType} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw]">
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
              })} required />
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
              })} required />
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
        <DialogContent className="sm:max-w-[500px] w-[95vw]">
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
                  <p className="font-medium">{selectedAnnouncement.type === 'notice' ? '通知' : selectedAnnouncement.type === 'training' ? '培训' : '表彰'}</p>
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