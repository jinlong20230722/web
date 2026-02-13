// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Eye, Calendar, User, Building, Briefcase, CheckCircle, XCircle } from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { Pagination } from '@/components/Pagination';
import { mergeDataWithReference } from '@/lib/utils.js';
import { hasPermission, getUserRole } from '@/lib/permissions';
export default function Leave(props) {
  const [leaveList, setLeaveList] = useState([]);
  const [personnelData, setPersonnelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [approveAction, setApproveAction] = useState('');
  const {
    toast
  } = useToast();
  const {
    currentUser
  } = props.$w.auth;
  const userRole = getUserRole(currentUser);
  const canApproveLeave = hasPermission(currentUser, 'approve:leave');
  const loadLeaveList = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (selectedStatus !== 'all') {
        filter.approval_status = {
          $eq: selectedStatus
        };
      }

      // 加载请假数据
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'leave_request',
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
            submit_time: 'desc'
          }]
        }
      });

      // 加载人员数据
      const personnelResult = await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 1000
        }
      });
      setPersonnelData(personnelResult.records || []);

      // 使用优化后的数据关联函数
      const mergedData = mergeDataWithReference(result.records || [], personnelResult.records || [], 'personnel_id', '_id', {
        name: 'name',
        department: 'department',
        position: 'position',
        phone: 'phone'
      });

      // 姓名或手机号筛选
      let filteredData = mergedData;
      if (searchKeyword) {
        filteredData = mergedData.filter(record => record.name && record.name.includes(searchKeyword) || record.phone && record.phone.includes(searchKeyword));
      }
      setLeaveList(filteredData);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0
      }));
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载请假记录失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadLeaveList();
  }, [pagination.page, searchKeyword, selectedStatus]);
  const handleView = record => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };
  const handleApprove = (record, action) => {
    setSelectedRecord(record);
    setApproveAction(action);
    setIsApproveDialogOpen(true);
  };
  const submitApproval = async () => {
    try {
      await props.$w.cloud.callDataSource({
        dataSourceName: 'leave_request',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            approval_status: approveAction === 'approve' ? '已通过' : '已拒绝'
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
        title: '审批成功',
        description: approveAction === 'approve' ? '请假申请已通过' : '请假申请已拒绝'
      });
      setIsApproveDialogOpen(false);
      loadLeaveList();
    } catch (error) {
      toast({
        title: '审批失败',
        description: error.message || '审批操作失败',
        variant: 'destructive'
      });
    }
  };
  const formatTime = timestamp => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };
  const getStatusBadge = status => {
    const config = {
      '待审批': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800'
      },
      '已通过': {
        bg: 'bg-green-100',
        text: 'text-green-800'
      },
      '已拒绝': {
        bg: 'bg-red-100',
        text: 'text-red-800'
      }
    };
    const style = config[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>;
  };
  return <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage="leave" $w={props.$w} />
      <div className="flex-1 flex flex-col">
        <TopNav currentUser={currentUser} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">请假管理</h2>
            <p className="text-gray-500 mt-1">审批和管理请假申请</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="搜索姓名或手机号..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="审批状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="待审批">待审批</SelectItem>
                  <SelectItem value="已通过">已通过</SelectItem>
                  <SelectItem value="已拒绝">已拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">姓名</TableHead>
                  <TableHead className="font-semibold">部门</TableHead>
                  <TableHead className="font-semibold">职务</TableHead>
                  <TableHead className="font-semibold">请假时间</TableHead>
                  <TableHead className="font-semibold">请假原因</TableHead>
                  <TableHead className="font-semibold">审批状态</TableHead>
                  <TableHead className="font-semibold text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      加载中...
                    </TableCell>
                  </TableRow> : leaveList.length === 0 ? <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow> : leaveList.map(record => <TableRow key={record._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{record.position}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>开始：{formatTime(record.start_time)}</div>
                          <div>结束：{formatTime(record.end_time)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{record.reason}</TableCell>
                      <TableCell>{getStatusBadge(record.approval_status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(record)}>
                            <Eye size={16} />
                          </Button>
                          {canApproveLeave && record.approval_status === '待审批' && <>
                              <Button variant="ghost" size="sm" onClick={() => handleApprove(record, 'approve')}>
                                <CheckCircle size={16} className="text-green-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleApprove(record, 'reject')}>
                                <XCircle size={16} className="text-red-500" />
                              </Button>
                            </>}
                        </div>
                      </TableCell>
                    </TableRow>)}
              </TableBody>
            </Table>

            <Pagination currentPage={pagination.page} totalPages={Math.ceil(pagination.total / pagination.pageSize)} totalRecords={pagination.total} pageSize={pagination.pageSize} onPageChange={page => setPagination(prev => ({
            ...prev,
            page
          }))} />
          </div>
        </main>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>请假详情</DialogTitle>
            <DialogDescription>查看请假申请详细信息</DialogDescription>
          </DialogHeader>
          {selectedRecord && <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-500">姓名</Label>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="font-medium">{selectedRecord.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">手机号</Label>
                  <span className="font-medium">{selectedRecord.phone}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">所属部门</Label>
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-gray-400" />
                    <span className="font-medium">{selectedRecord.department}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">职务</Label>
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-400" />
                    <span className="font-medium">{selectedRecord.position}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">请假开始时间</Label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium">{formatTime(selectedRecord.start_time)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">请假结束时间</Label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium">{formatTime(selectedRecord.end_time)}</span>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-gray-500">请假原因</Label>
                  <p className="font-medium">{selectedRecord.reason}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">审批状态</Label>
                  {getStatusBadge(selectedRecord.approval_status)}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">提交时间</Label>
                  <span className="font-medium">{formatTime(selectedRecord.submit_time)}</span>
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认审批</DialogTitle>
            <DialogDescription>
              {approveAction === 'approve' ? `确定要通过「${selectedRecord?.name}」的请假申请吗？` : `确定要拒绝「${selectedRecord?.name}」的请假申请吗？`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={submitApproval} className={approveAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
              {approveAction === 'approve' ? '通过' : '拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}