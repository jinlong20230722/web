// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Textarea, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Plus, Edit, Trash2, Eye, Megaphone as MegaphoneIcon, Calendar, User, Building2, Bell, AlertTriangle, Award } from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import AnnouncementEditModal from '@/components/AnnouncementEditModal';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { TableSkeleton } from '@/components/TableSkeleton';
import { hasPermission, getUserRole } from '@/lib/permissions';
const iconMap = {
  bell: Bell,
  warning: AlertTriangle,
  award: Award
};
const iconColorMap = {
  bell: 'text-blue-500',
  warning: 'text-yellow-500',
  award: 'text-amber-500'
};
export default function Announcement(props) {
  const [announcementList, setAnnouncementList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  const {
    currentUser
  } = props.$w.auth;
  const userRole = getUserRole(currentUser);
  const canCreateAnnouncement = hasPermission(currentUser, 'create:announcement');
  const canEditAnnouncement = hasPermission(currentUser, 'edit:announcement');
  const canDeleteAnnouncement = hasPermission(currentUser, 'delete:announcement');
  const handleLogout = async () => {
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      await tcb.auth().signOut();
      await tcb.auth().signInAnonymously();
      await props.$w.auth.getUserInfo({
        force: true
      });
      toast({
        title: '退出成功',
        description: '您已成功退出登录'
      });
    } catch (error) {
      toast({
        title: '退出失败',
        description: error.message || '退出登录时发生错误',
        variant: 'destructive'
      });
    }
  };
  const loadAnnouncementList = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (searchKeyword) {
        filter.$or = [{
          title: {
            $search: searchKeyword
          }
        }, {
          content: {
            $search: searchKeyword
          }
        }];
      }
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'announcement',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: filter
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: pagination.pageSize,
          pageNumber: pagination.page,
          orderBy: [{
            publish_time: 'desc'
          }]
        }
      });
      setAnnouncementList(result.records || []);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0
      }));
    } catch (error) {
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
    loadAnnouncementList();
  }, [pagination.page, searchKeyword]);
  const handleView = record => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };
  const handleEdit = record => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };
  const handleDeleteClick = record => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };
  const handleDelete = async () => {
    try {
      await props.$w.cloud.callDataSource({
        dataSourceName: 'announcement',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: selectedRecord._id
                }
              }]
            }
          }
        }
      });
      toast({
        title: '删除成功',
        description: '公告已删除'
      });
      setIsDeleteDialogOpen(false);
      loadAnnouncementList();
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.message || '删除公告失败',
        variant: 'destructive'
      });
    }
  };
  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    loadAnnouncementList();
  };
  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    loadAnnouncementList();
  };
  const formatTime = timestamp => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };
  return <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage="announcement" $w={props.$w} />
      <div className="flex-1 flex flex-col">
        <TopNav currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">公告管理</h2>
            <p className="text-gray-500 mt-1">发布和管理系统公告</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="搜索标题或内容..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="pl-10" />
                </div>
              </div>
              {canCreateAnnouncement && <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateDialogOpen(true)} title="发布新公告">
                <Plus className="mr-2" size={16} />
                发布公告
              </Button>}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold whitespace-nowrap min-w-[60px]">图标</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap min-w-[200px]">公告标题</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap min-w-[120px]">发布部门</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap min-w-[100px]">发布人</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap min-w-[180px]">发布时间</TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap min-w-[200px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? <TableSkeleton columns={6} rows={5} /> : announcementList.length === 0 ? <TableRow>
                      <TableCell colSpan={6}>
                        <EmptyState title="暂无公告数据" description="当前没有公告信息" icon={MegaphoneIcon} />
                      </TableCell>
                    </TableRow> : announcementList.map(record => {
                  const IconComponent = iconMap[record.icon] || Bell;
                  const iconColor = iconColorMap[record.icon] || 'text-gray-500';
                  return <TableRow key={record._id} className="hover:bg-gray-50">
                        <TableCell className="whitespace-nowrap">
                          <IconComponent className={`h-5 w-5 ${iconColor}`} />
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{record.title}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            <span className="text-sm">{record.publisher_department || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            {record.publisher}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            {formatTime(record.publish_time)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(record)} title="查看详情">
                              <Eye size={16} />
                            </Button>
                            {canEditAnnouncement && <Button variant="ghost" size="sm" onClick={() => handleEdit(record)} title="编辑公告">
                              <Edit size={16} />
                            </Button>}
                            {canDeleteAnnouncement && <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(record)} title="删除公告">
                              <Trash2 size={16} />
                            </Button>}
                          </div>
                        </TableCell>
                      </TableRow>;
                })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 分页 */}
          <Pagination currentPage={pagination.page} totalPages={Math.ceil(pagination.total / pagination.pageSize)} totalRecords={pagination.total} pageSize={pagination.pageSize} onPageChange={page => setPagination(prev => ({
          ...prev,
          page
        }))} />
        </main>
      </div>

      {/* 查看详情对话框 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>公告详情</DialogTitle>
            <DialogDescription>查看公告详细信息</DialogDescription>
          </DialogHeader>
          {selectedRecord && <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-500">公告标题</label>
                <div className="flex items-center gap-3">
                  {(() => {
                const IconComponent = iconMap[selectedRecord.icon] || Bell;
                const iconColor = iconColorMap[selectedRecord.icon] || 'text-gray-500';
                return <IconComponent className={`h-6 w-6 ${iconColor}`} />;
              })()}
                  <div className="font-medium text-lg">{selectedRecord.title}</div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-500">发布部门</label>
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-gray-400" />
                  <span>{selectedRecord.publisher_department || '-'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-500">发布人</label>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span>{selectedRecord.publisher}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-500">发布时间</label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{formatTime(selectedRecord.publish_time)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-500">公告内容</label>
                <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{selectedRecord.content}</div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {/* 创建公告对话框 */}
      <AnnouncementEditModal open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onSuccess={handleCreateSuccess} mode="create" currentUserName={currentUser?.name || currentUser?.nickName || '管理员'} $w={props.$w} />

      {/* 编辑公告对话框 */}
      <AnnouncementEditModal open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} onSuccess={handleEditSuccess} mode="edit" announcement={selectedRecord} currentUserName={currentUser?.name || currentUser?.nickName || '管理员'} $w={props.$w} />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除公告「{selectedRecord?.title}」吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}