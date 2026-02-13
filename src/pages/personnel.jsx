// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, useToast, Checkbox } from '@/components/ui';
// @ts-ignore;
import { Search, Plus, Edit, Trash2, Eye, User, Phone, Building, Briefcase, Filter, X, CheckSquare, Square } from 'lucide-react';

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
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [isBatchStatusDialogOpen, setIsBatchStatusDialogOpen] = useState(false);
  const [batchStatus, setBatchStatus] = useState('');
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
      // 构建查询条件
      const where = {};

      // 关键词搜索
      if (searchKeyword) {
        where.$or = [{
          name: {
            $regex: searchKeyword
          }
        }, {
          phone: {
            $regex: searchKeyword
          }
        }];
      }

      // 部门筛选（支持多选）
      if (selectedDepartments.length > 0) {
        where.department = {
          $in: selectedDepartments
        };
      } else if (selectedDepartment !== 'all') {
        where.department = {
          $eq: selectedDepartment
        };
      }

      // 日期范围筛选
      if (dateRange.start) {
        where.register_time = {
          $gte: new Date(dateRange.start).getTime()
        };
      }
      if (dateRange.end) {
        if (!where.register_time) {
          where.register_time = {};
        }
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        where.register_time.$lte = endDate.getTime();
      }

      // 在职状态筛选（需要在获取数据后过滤）
      if (selectedStatus !== 'all') {
        where.employment_status = {
          $eq: selectedStatus
        };
      }

      // 加载人员数据
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where
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
  }, [pagination.page, searchKeyword, selectedDepartment, selectedDepartments, selectedStatus, dateRange]);

  // 全选/取消全选
  const handleSelectAll = checked => {
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(personnelList.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  // 单选
  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: '提示',
        description: '请先选择要删除的人员',
        variant: 'destructive'
      });
      return;
    }
    try {
      await Promise.all(selectedIds.map(id => props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaDeleteV2',
        params: {
          data: {
            _id: id
          }
        }
      })));
      toast({
        title: '删除成功',
        description: `已删除 ${selectedIds.length} 名人员`
      });
      setIsBatchDeleteDialogOpen(false);
      setSelectedIds([]);
      setSelectAll(false);
      loadPersonnelList();
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.message || '批量删除失败',
        variant: 'destructive'
      });
    }
  };

  // 批量修改状态
  const handleBatchStatusChange = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: '提示',
        description: '请先选择要修改状态的人员',
        variant: 'destructive'
      });
      return;
    }
    if (!batchStatus) {
      toast({
        title: '提示',
        description: '请选择要修改的状态',
        variant: 'destructive'
      });
      return;
    }
    try {
      await Promise.all(selectedIds.map(id => props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            _id: id,
            employment_status: batchStatus
          }
        }
      })));
      toast({
        title: '修改成功',
        description: `已将 ${selectedIds.length} 名人员状态修改为 ${batchStatus}`
      });
      setIsBatchStatusDialogOpen(false);
      setSelectedIds([]);
      setSelectAll(false);
      setBatchStatus('');
      loadPersonnelList();
    } catch (error) {
      toast({
        title: '修改失败',
        description: error.message || '批量修改状态失败',
        variant: 'destructive'
      });
    }
  };

  // 重置筛选条件
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedDepartment('all');
    setSelectedDepartments([]);
    setSelectedStatus('all');
    setDateRange({
      start: '',
      end: ''
    });
    setShowAdvancedFilter(false);
  };

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
          data: {
            _id: selectedRecord._id
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
              <Button variant="outline" onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}>
                <Filter className="mr-2" size={16} />
                高级筛选
              </Button>
              {canAddPersonnel && <Button className="bg-slate-600 hover:bg-slate-700" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2" size={16} />
                添加人员
              </Button>}
            </div>
            
            {/* 高级筛选面板 */}
            {showAdvancedFilter && <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>部门多选</Label>
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                      <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer" onClick={() => setSelectedDepartments([])}>
                        <Checkbox checked={selectedDepartments.length === 0} />
                        <span className="text-sm">全部部门</span>
                      </div>
                      {departments.map(dept => <div key={dept} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer" onClick={() => {
                    if (selectedDepartments.includes(dept)) {
                      setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                    } else {
                      setSelectedDepartments([...selectedDepartments, dept]);
                    }
                  }}>
                          <Checkbox checked={selectedDepartments.includes(dept)} />
                          <span className="text-sm">{dept}</span>
                        </div>)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>入职开始日期</Label>
                    <Input type="date" value={dateRange.start} onChange={e => setDateRange({
                  ...dateRange,
                  start: e.target.value
                })} />
                  </div>
                  <div className="space-y-2">
                    <Label>入职结束日期</Label>
                    <Input type="date" value={dateRange.end} onChange={e => setDateRange({
                  ...dateRange,
                  end: e.target.value
                })} />
                  </div>
                  <div className="space-y-2">
                    <Label>在职状态</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="在职">在职</SelectItem>
                        <SelectItem value="离职">离职</SelectItem>
                        <SelectItem value="休假">休假</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    <X className="mr-2" size={14} />
                    重置筛选
                  </Button>
                  <span className="text-sm text-gray-500 ml-auto">
                    已选择 {selectedDepartments.length} 个部门
                  </span>
                </div>
              </div>}
          </div>
          
          {/* 批量操作工具栏 */}
          {selectedIds.length > 0 && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-800 font-medium">已选择 {selectedIds.length} 条记录</span>
                </div>
                <div className="flex gap-2">
                  {canEditPersonnel && <Button variant="outline" size="sm" onClick={() => setIsBatchStatusDialogOpen(true)}>
                      <Edit className="mr-2" size={14} />
                      批量修改状态
                    </Button>}
                  {canDeletePersonnel && <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => setIsBatchDeleteDialogOpen(true)}>
                      <Trash2 className="mr-2" size={14} />
                      批量删除
                    </Button>}
                  <Button variant="ghost" size="sm" onClick={() => {
                setSelectedIds([]);
                setSelectAll(false);
              }}>
                    <X className="mr-2" size={14} />
                    取消选择
                  </Button>
                </div>
              </div>
            </div>}

          {/* 数据表格 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold w-12">
                    <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                  </TableHead>
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
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      加载中...
                    </TableCell>
                  </TableRow> : personnelList.length === 0 ? <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow> : personnelList.map(person => {
                const status = getEmploymentStatus(person._id);
                return <TableRow key={person._id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox checked={selectedIds.includes(person._id)} onCheckedChange={checked => handleSelectOne(person._id, checked)} />
                        </TableCell>
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell>{person.phone}</TableCell>
                        <TableCell>{person.department}</TableCell>
                        <TableCell>{person.position}</TableCell>
                        <TableCell>{person.gender}</TableCell>
                        <TableCell>{person.age}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === '在职' ? 'bg-emerald-100 text-emerald-800' : status === '已离职' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
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
      
      {/* 批量删除确认对话框 */}
      <Dialog open={isBatchDeleteDialogOpen} onOpenChange={setIsBatchDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认批量删除</DialogTitle>
            <DialogDescription>
              确定要删除选中的 {selectedIds.length} 名人员吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleBatchDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 批量修改状态对话框 */}
      <Dialog open={isBatchStatusDialogOpen} onOpenChange={setIsBatchStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量修改状态</DialogTitle>
            <DialogDescription>
              将选中的 {selectedIds.length} 名人员状态修改为：
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={batchStatus} onValueChange={setBatchStatus}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchStatusDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleBatchStatusChange} className="bg-slate-600 hover:bg-slate-700">
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}