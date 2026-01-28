// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { getRecords, createRecord, updateRecord, deleteRecord, formatDate, formatDateTime } from '@/lib/dataSource';
export default function LeaveRequest(props) {
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [formData, setFormData] = useState({
    personnelId: '',
    personnelName: '',
    leaveType: '事假',
    startTime: '',
    endTime: '',
    reason: ''
  });

  // 加载请假数据
  const loadLeaveRequests = async () => {
    setLoading(true);
    try {
      const result = await getRecords('leave_request', {}, 100, 1, [{
        createdAt: 'desc'
      }]);
      if (result && result.records) {
        setLeaveRequests(result.records);
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载请假数据失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadLeaveRequests();
  }, []);
  const columns = [{
    key: '_id',
    label: 'ID'
  }, {
    key: 'personnelName',
    label: '姓名'
  }, {
    key: 'leaveType',
    label: '请假类型'
  }, {
    key: 'startTime',
    label: '开始时间',
    render: value => formatDateTime(value)
  }, {
    key: 'endTime',
    label: '结束时间',
    render: value => formatDateTime(value)
  }, {
    key: 'reason',
    label: '请假原因'
  }, {
    key: 'approvalStatus',
    label: '审批状态',
    render: value => {
      const statusMap = {
        '已通过': 'bg-green-100 text-green-700',
        '已拒绝': 'bg-red-100 text-red-700',
        '待审批': 'bg-yellow-100 text-yellow-700'
      };
      return <span className={`px-2 py-1 rounded-full text-xs ${statusMap[value] || 'bg-gray-100 text-gray-700'}`}>
          {value || '待审批'}
        </span>;
    }
  }];
  const filterOptions = [{
    value: 'all',
    label: '全部状态'
  }, {
    value: 'pending',
    label: '待审批'
  }, {
    value: 'approved',
    label: '已通过'
  }, {
    value: 'rejected',
    label: '已拒绝'
  }];
  const filteredData = leaveRequests.filter(item => {
    const matchesSearch = item.personnelName?.toLowerCase().includes(searchTerm.toLowerCase()) || item.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === 'pending' && item.approvalStatus === '待审批' || filterStatus === 'approved' && item.approvalStatus === '已通过' || filterStatus === 'rejected' && item.approvalStatus === '已拒绝';
    return matchesSearch && matchesFilter;
  });
  const handleAdd = () => {
    setFormData({
      personnelId: '',
      personnelName: '',
      leaveType: '事假',
      startTime: '',
      endTime: '',
      reason: ''
    });
    setIsDialogOpen(true);
  };
  const handleView = item => {
    setSelectedRequest(item);
    setIsViewDialogOpen(true);
  };
  const handleApprove = async item => {
    if (confirm('确定要通过该请假申请吗？')) {
      try {
        await updateRecord('leave_request', {
          approvalStatus: '已通过',
          approvalTime: Date.now()
        }, {
          $and: [{
            _id: {
              $eq: item._id
            }
          }]
        });
        toast({
          title: '审批成功',
          description: '请假申请已通过'
        });
        loadLeaveRequests();
      } catch (error) {
        toast({
          title: '审批失败',
          description: error.message || '审批失败',
          variant: 'destructive'
        });
      }
    }
  };
  const handleReject = async item => {
    if (confirm('确定要拒绝该请假申请吗？')) {
      try {
        await updateRecord('leave_request', {
          approvalStatus: '已拒绝'
        }, {
          $and: [{
            _id: {
              $eq: item._id
            }
          }]
        });
        toast({
          title: '审批成功',
          description: '请假申请已拒绝'
        });
        loadLeaveRequests();
      } catch (error) {
        toast({
          title: '审批失败',
          description: error.message || '审批失败',
          variant: 'destructive'
        });
      }
    }
  };
  const handleDelete = async item => {
    if (confirm('确定要删除该请假记录吗？')) {
      try {
        await deleteRecord('leave_request', {
          $and: [{
            _id: {
              $eq: item._id
            }
          }]
        });
        toast({
          title: '删除成功',
          description: '请假记录已删除'
        });
        loadLeaveRequests();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除请假记录失败',
          variant: 'destructive'
        });
      }
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const data = {
        personnelId: formData.personnelId,
        personnelName: formData.personnelName,
        leaveType: formData.leaveType,
        startTime: new Date(formData.startTime).getTime(),
        endTime: new Date(formData.endTime).getTime(),
        reason: formData.reason,
        approvalStatus: '待审批'
      };
      await createRecord('leave_request', data);
      toast({
        title: '申请成功',
        description: '请假申请已提交'
      });
      setIsDialogOpen(false);
      loadLeaveRequests();
    } catch (error) {
      toast({
        title: '申请失败',
        description: error.message || '提交请假申请失败',
        variant: 'destructive'
      });
    }
  };
  return <PageLayout currentPage="leave_request" onPageChange={pageId => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {}
    });
  }} title="请假销假管理" subtitle="处理请假申请和销假记录" user={props.$w?.auth?.currentUser}>
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          + 申请请假
        </Button>
      </div>

      <DataTable columns={columns} data={filteredData} onView={handleView} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>申请请假</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personnelName">姓名 *</Label>
                  <Input id="personnelName" value={formData.personnelName} onChange={e => setFormData({
                  ...formData,
                  personnelName: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personnelId">人员ID *</Label>
                  <Input id="personnelId" value={formData.personnelId} onChange={e => setFormData({
                  ...formData,
                  personnelId: e.target.value
                })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaveType">请假类型 *</Label>
                <Select value={formData.leaveType} onValueChange={value => setFormData({
                ...formData,
                leaveType: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="事假">事假</SelectItem>
                    <SelectItem value="病假">病假</SelectItem>
                    <SelectItem value="年假">年假</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">开始时间 *</Label>
                  <Input id="startTime" type="datetime-local" value={formData.startTime} onChange={e => setFormData({
                  ...formData,
                  startTime: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">结束时间 *</Label>
                  <Input id="endTime" type="datetime-local" value={formData.endTime} onChange={e => setFormData({
                  ...formData,
                  endTime: e.target.value
                })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">请假原因 *</Label>
                <Textarea id="reason" value={formData.reason} onChange={e => setFormData({
                ...formData,
                reason: e.target.value
              })} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                提交申请
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>请假详情</DialogTitle>
          </DialogHeader>
          {selectedRequest && <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">姓名</Label>
                  <p className="font-medium">{selectedRequest.personnelName}</p>
                </div>
                <div>
                  <Label className="text-gray-600">请假类型</Label>
                  <p className="font-medium">{selectedRequest.leaveType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">开始时间</Label>
                  <p className="font-medium">{formatDateTime(selectedRequest.startTime)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">结束时间</Label>
                  <p className="font-medium">{formatDateTime(selectedRequest.endTime)}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">请假原因</Label>
                <p className="font-medium">{selectedRequest.reason}</p>
              </div>
              <div>
                <Label className="text-gray-600">审批状态</Label>
                <p className={`font-medium px-2 py-1 rounded-full text-xs inline-block ${selectedRequest.approvalStatus === '已通过' ? 'bg-green-100 text-green-700' : selectedRequest.approvalStatus === '已拒绝' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {selectedRequest.approvalStatus || '待审批'}
                </p>
              </div>
              {selectedRequest.approvalStatus === '已通过' && <div>
                  <Label className="text-gray-600">审批人</Label>
                  <p className="font-medium">{selectedRequest.approver || '-'}</p>
                </div>}
            </div>}
        </DialogContent>
      </Dialog>
    </PageLayout>;
}