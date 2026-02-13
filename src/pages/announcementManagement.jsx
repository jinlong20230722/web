// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Plus, Edit, Eye, ArrowUpDown, Search, FileText, Calendar, User, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

import { Badge } from '@/components/Badge';
import AnnouncementEditModal from '@/components/AnnouncementEditModal';
export default function AnnouncementManagement({
  className,
  style,
  $w
}) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'publish_time',
    direction: 'desc'
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMode, setEditMode] = useState('create');
  const {
    toast
  } = $w.utils.toast ? $w.utils.toast : {
    toast: msg => console.log(msg)
  };

  // 获取当前用户信息
  const currentUser = $w.auth.currentUser || {};
  const currentUserName = currentUser.name || currentUser.nickName || '管理员';

  // 加载公告列表
  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 构建查询条件
      const where = {};

      // 状态筛选
      if (statusFilter !== 'all') {
        where.status = statusFilter;
      }

      // 搜索关键词
      if (searchKeyword) {
        where.title = {
          $regex: searchKeyword,
          $options: 'i'
        };
      }

      // 排序
      const orderBy = {};
      orderBy[sortConfig.key] = sortConfig.direction === 'asc' ? 1 : -1;
      const result = await db.collection('announcement').where(where).orderBy(orderBy).skip((pagination.current - 1) * pagination.pageSize).limit(pagination.pageSize).get();

      // 获取总数
      const countResult = await db.collection('announcement').where(where).count();
      setAnnouncements(result.data || []);
      setPagination(prev => ({
        ...prev,
        total: countResult.total
      }));
    } catch (error) {
      console.error('加载公告列表失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '加载公告列表失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAnnouncements();
  }, [pagination.current, sortConfig, statusFilter]);

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    loadAnnouncements();
  };

  // 排序处理
  const handleSort = key => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 新增公告
  const handleCreate = () => {
    setEditMode('create');
    setSelectedAnnouncement(null);
    setIsEditModalOpen(true);
  };

  // 编辑公告
  const handleEdit = announcement => {
    setEditMode('edit');
    setSelectedAnnouncement(announcement);
    setIsEditModalOpen(true);
  };

  // 查看公告
  const handleView = announcement => {
    setSelectedAnnouncement(announcement);
    setIsViewModalOpen(true);
  };

  // 下线公告
  const handleOffline = async announcement => {
    if (!window.confirm(`确定要下线公告「${announcement.title}」吗？`)) {
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('announcement').doc(announcement._id).update({
        status: '已下线'
      });
      toast({
        title: '下线成功',
        description: '公告已成功下线'
      });
      loadAnnouncements();
    } catch (error) {
      console.error('下线公告失败:', error);
      toast({
        title: '下线失败',
        description: error.message || '下线公告失败',
        variant: 'destructive'
      });
    }
  };

  // 编辑成功回调
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    loadAnnouncements();
  };

  // 格式化时间
  const formatTime = timestamp => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取状态样式
  const getStatusStyle = status => {
    switch (status) {
      case '已发布':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case '已下线':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" style={style}>
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">公告管理</h1>
          <p className="text-slate-600">管理系统公告信息，支持新增、编辑和下线公告</p>
        </div>

        {/* 操作栏 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* 搜索框 */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input placeholder="搜索公告标题..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} className="pl-10" />
              </div>
            </div>

            {/* 状态筛选 */}
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="公告状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="已发布">已发布</SelectItem>
                  <SelectItem value="已下线">已下线</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 搜索按钮 */}
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>

            {/* 新增按钮 */}
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              新增公告
            </Button>
          </div>
        </div>

        {/* 公告列表 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                  <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      公告标题
                      {sortConfig.key === 'title' && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => handleSort('publisher')}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      发布人
                      {sortConfig.key === 'publisher' && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => handleSort('publish_time')}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      发布时间
                      {sortConfig.key === 'publish_time' && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    公告状态
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      加载中...
                    </td>
                  </tr> : announcements.length === 0 ? <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-12 w-12 text-slate-300" />
                        <p>暂无公告数据</p>
                      </div>
                    </td>
                  </tr> : announcements.map(announcement => <tr key={announcement._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 max-w-md truncate">
                          {announcement.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {announcement.publisher || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatTime(announcement.publish_time)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusStyle(announcement.status)}>
                          {announcement.status || '-'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleView(announcement)} className="text-slate-600 border-slate-600 hover:bg-slate-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(announcement)} className="text-slate-600 border-slate-600 hover:bg-slate-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {announcement.status === '已发布' && <Button size="sm" variant="outline" onClick={() => handleOffline(announcement)} className="text-orange-600 border-orange-600 hover:bg-orange-50">
                              下线
                            </Button>}
                        </div>
                      </td>
                    </tr>)}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {pagination.total > 0 && <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                共 {pagination.total} 条记录，第 {pagination.current} 页
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPagination(prev => ({
              ...prev,
              current: Math.max(1, prev.current - 1)
            }))} disabled={pagination.current === 1}>
                  上一页
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPagination(prev => ({
              ...prev,
              current: Math.min(Math.ceil(pagination.total / pagination.pageSize), prev.current + 1)
            }))} disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}>
                  下一页
                </Button>
              </div>
            </div>}
        </div>
      </div>

      {/* 查看详情弹窗 */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">公告详情</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && <div className="space-y-6">
              {/* 基本信息 */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  基本信息
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-24 text-slate-600 font-medium">公告标题：</span>
                    <span className="flex-1 text-slate-800 font-semibold">{selectedAnnouncement.title}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-600 font-medium">发布人：</span>
                    <span className="flex-1 text-slate-800">{selectedAnnouncement.publisher || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-600 font-medium">发布时间：</span>
                    <span className="flex-1 text-slate-800">{formatTime(selectedAnnouncement.publish_time)}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-600 font-medium">公告状态：</span>
                    <span className="flex-1">
                      <Badge className={getStatusStyle(selectedAnnouncement.status)}>
                        {selectedAnnouncement.status || '-'}
                      </Badge>
                    </span>
                  </div>
                </div>
              </div>

              {/* 公告内容 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  公告内容
                </h3>
                <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedAnnouncement.content || '暂无内容'}
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {/* 编辑弹窗 */}
      <AnnouncementEditModal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={handleEditSuccess} mode={editMode} announcement={selectedAnnouncement} currentUserName={currentUserName} $w={$w} />
    </div>;
}