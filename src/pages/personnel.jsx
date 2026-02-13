// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Plus, Edit, Trash2, Eye, User, Phone, Building, Briefcase } from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import PersonnelDetailModal from '@/components/PersonnelDetailModal';
import PersonnelAddModal from '@/components/PersonnelAddModal';
import { Pagination } from '@/components/Pagination';
import { hasPermission, getUserRole } from '@/lib/permissions';
export default function Personnel(props) {
  const [personnelList, setPersonnelList] = useState([]);
  const [resignationList, setResignationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const {
    toast
  } = useToast();
  const {
    currentUser
  } = props.$w.auth;
  const userRole = getUserRole(currentUser);
  const canAddPersonnel = hasPermission(currentUser, 'add:personnel');
  const canEditPersonnel = hasPermission(currentUser, 'edit:personnel');
  const canDeletePersonnel = hasPermission(currentUser, 'delete:personnel');
  const canViewPersonnel = hasPermission(currentUser, 'view:personnel');

  // 加载人员列表
  const loadPersonnelList = async () => {
    setLoading(true);
    try {
      // 加载人员数据
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: searchKeyword ? {
              $or: [{
                name: {
                  $search: searchKeyword
                }
              }, {
                phone: {
                  $search: searchKeyword
                }
              }]
            } : selectedDepartment !== 'all' ? {
              department: {
                $eq: selectedDepartment
              }
            } : {}
          },
          select: {
            $master: true,
            employment_status: true
          },
          getCount: true,
          pageSize: pagination.pageSize,
          pageNumber: pagination.page,
          orderBy: [{
            register_time: 'desc'
          }]
        }
      });
      setPersonnelList(result.records || []);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0
      }));

      // 加载离职申请数据
      const resignationResult = await props.$w.cloud.callDataSource({
        dataSourceName: 'resignation',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 1000
        }
      });
      setResignationList(resignationResult.records || []);
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载人员列表失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  // 根据离职申请记录计算在职状态
  const getEmploymentStatus = personnelId => {
    const resignation = resignationList.find(r => r.personnel_id === personnelId);
    if (!resignation) {
      return '在职';
    }
    if (resignation.status === 'approved') {
      return '已离职';
    }
    if (resignation.status === 'pending') {
      return '离职申请中';
    }
    return '在职';
  };
  useEffect(() => {
    loadPersonnelList();
  }, [pagination.page, searchKeyword, selectedDepartment]);

  // 查看详情
  const handleView = record => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  // 编辑
  const handleEdit = record => {
    setSelectedRecord(record);
    setEditForm({
      ...record
    });
    setIsEditDialogOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            name: editForm.name,
            phone: editForm.phone,
            department: editForm.department,
            position: editForm.position,
            emergency_contact_name: editForm.emergency_contact_name,
            emergency_contact_phone: editForm.emergency_contact_phone,
            employment_status: editForm.employment_status
          },
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
        title: '保存成功',
        description: '人员信息已更新'
      });
      setIsEditDialogOpen(false);
      loadPersonnelList();
    } catch (error) {
      toast({
        title: '保存失败',
        description: error.message || '更新人员信息失败',
        variant: 'destructive'
      });
    }
  };

  // 删除
  const handleDelete = async () => {
    try {
      await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
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
        description: '人员已删除'
      });
      setIsDeleteDialogOpen(false);
      loadPersonnelList();
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.message || '删除人员失败',
        variant: 'destructive'
      });
    }
  };
  // 固定的部门列表
  const departments = ['保安一部', '保安二部', '保安三部', '保安四部', '保安五部', '保安六部', '保安七部', '保安八部', '人事部', '运营部', '财务部', '物资部', '品质部', '品宣部', '外勤部'];
  return <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage="personnel" $w={props.$w} />
      <div className="flex-1 flex flex-col">
        <TopNav currentUser={currentUser} />
        <main className="flex-1 p-6 overflow-auto">
          {/* 页面标题 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">人员管理</h2>
            <p className="text-gray-500 mt-1">管理保安人员信息和档案</p>
          </div>

          {/* 操作栏 */}
          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="搜索姓名或手机号..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
              {canAddPersonnel && <Button className="bg-slate-600 hover:bg-slate-700" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2" size={16} />
                添加人员
              </Button>}
            </div>
          </div>

          {/* 数据表格 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">姓名</TableHead>
                  <TableHead className="font-semibold">手机号</TableHead>
                  <TableHead className="font-semibold">部门</TableHead>
                  <TableHead className="font-semibold">职务</TableHead>
                  <TableHead className="font-semibold">性别</TableHead>
                  <TableHead className="font-semibold">年龄</TableHead>
                  <TableHead className="font-semibold">在职状态</TableHead>
                  <TableHead className="font-semibold text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      加载中...
                    </TableCell>
                  </TableRow> : personnelList.length === 0 ? <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow> : personnelList.map(person => {
                const status = getEmploymentStatus(person._id);
                return <TableRow key={person._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell>{person.phone}</TableCell>
                        <TableCell>{person.department}</TableCell>
                        <TableCell>{person.position}</TableCell>
                        <TableCell>{person.gender}</TableCell>
                        <TableCell>{person.age}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === '在职' ? 'bg-green-100 text-green-800' : status === '已离职' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(person)}>
                              <Eye size={16} />
                            </Button>
                            {canEditPersonnel && <Button variant="ghost" size="sm" onClick={() => handleEdit(person)}>
                              <Edit size={16} />
                            </Button>}
                            {canDeletePersonnel && <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedRecord(person);
                        setIsDeleteDialogOpen(true);
                      }}>
                              <Trash2 size={16} className="text-red-500" />
                            </Button>}
                          </div>
                        </TableCell>
                      </TableRow>;
              })}
              </TableBody>
            </Table>

            {/* 分页 */}
            <Pagination currentPage={pagination.page} totalPages={Math.ceil(pagination.total / pagination.pageSize)} totalRecords={pagination.total} pageSize={pagination.pageSize} onPageChange={page => setPagination(prev => ({
            ...prev,
            page
          }))} />
          </div>
        </main>
      </div>

      {/* 查看详情对话框 */}
      {selectedRecord && <PersonnelDetailModal record={selectedRecord} onClose={() => setIsViewDialogOpen(false)} onEdit={() => {
      setIsViewDialogOpen(false);
      handleEdit(selectedRecord);
    }} $w={props.$w} />}

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑人员信息</DialogTitle>
            <DialogDescription>修改人员基本信息</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input value={editForm.name || ''} onChange={e => setEditForm({
              ...editForm,
              name: e.target.value
            })} />
            </div>
            <div className="space-y-2">
              <Label>手机号</Label>
              <Input value={editForm.phone || ''} onChange={e => setEditForm({
              ...editForm,
              phone: e.target.value
            })} />
            </div>
            <div className="space-y-2">
              <Label>所属部门</Label>
              <Select value={editForm.department || ''} onValueChange={value => setEditForm({
              ...editForm,
              department: value
            })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>职务</Label>
              <Input value={editForm.position || ''} onChange={e => setEditForm({
              ...editForm,
              position: e.target.value
            })} />
            </div>
            <div className="space-y-2">
              <Label>紧急联系人</Label>
              <Input value={editForm.emergency_contact_name || ''} onChange={e => setEditForm({
              ...editForm,
              emergency_contact_name: e.target.value
            })} />
            </div>
            <div className="space-y-2">
              <Label>紧急联系电话</Label>
              <Input value={editForm.emergency_contact_phone || ''} onChange={e => setEditForm({
              ...editForm,
              emergency_contact_phone: e.target.value
            })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>在职状态</Label>
              <Select value={editForm.employment_status || ''} onValueChange={value => setEditForm({
              ...editForm,
              employment_status: value
            })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="在职">在职</SelectItem>
                  <SelectItem value="离职">离职</SelectItem>
                  <SelectItem value="休假">休假</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit} className="bg-slate-600 hover:bg-slate-700">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除人员「{selectedRecord?.name}」吗？此操作不可恢复。
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

      {/* 添加人员弹窗 */}
      {isAddDialogOpen && <PersonnelAddModal onClose={() => setIsAddDialogOpen(false)} onSuccess={() => {
      loadPersonnelList();
    }} $w={props.$w} />}
    </div>;
}