// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Download, Calendar, Filter, RotateCcw } from 'lucide-react';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { getRecords, createRecord, updateRecord, deleteRecord, formatDate, formatDateTime } from '@/lib/dataSource';
export default function LeaveRequest(props) {
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState('table');
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
    key: 'index',
    label: '序号',
    render: (value, row, index) => index + 1
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
    const matchesType = filterType === 'all' || item.leaveType === filterType;
    const matchesStartDate = !startDate || item.startTime >= new Date(startDate).getTime();
    const matchesEndDate = !endDate || item.endTime <= new Date(endDate).getTime();
    return matchesSearch && matchesFilter && matchesType && matchesStartDate && matchesEndDate;
  });
  const handleExportCSV = () => {
    const headers = ['序号', '姓名', '请假类型', '开始时间', '结束时间', '请假原因', '审批状态'];
    const rows = filteredData.map((item, index) => [index + 1, item.personnelName || '', item.leaveType || '', formatDateTime(item.startTime) || '', formatDateTime(item.endTime) || '', item.reason || '', item.approvalStatus || '待审批']);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `请假记录_${formatDate(Date.now())}.csv`;
    link.click();
    toast({
      title: '导出成功',
      description: 'CSV 文件已下载'
    });
  };
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setStartDate('');
    setEndDate('');
  };
  const getChartData = () => {
    const statusData = filteredData.reduce((acc, item) => {
      const status = item.approvalStatus || '待审批';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.entries(statusData).map(([name, value]) => ({
      name,
      value
    }));
    const typeData = filteredData.reduce((acc, item) => {
      const type = item.leaveType || '未知';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const barData = Object.entries(typeData).map(([name, value]) => ({
      name,
      value
    }));
    return {
      pieData,
      barData
    };
  };
  const {
    pieData,
    barData
  } = getChartData();
  const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];
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
        <div className="flex gap-2">
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
            + 申请请假
          </Button>
          <Button onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')} variant="outline" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {viewMode === 'table' ? '统计图表' : '列表视图'}
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出 CSV
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" placeholder="开始日期" />
            <span className="text-gray-500">至</span>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" placeholder="结束日期" />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="请假类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="事假">事假</SelectItem>
                <SelectItem value="病假">病假</SelectItem>
                <SelectItem value="年假">年假</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleResetFilters} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            重置筛选
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? <DataTable columns={columns} data={filteredData} onView={handleView} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} /> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">审批状态分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({
              name,
              percent
            }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">请假类型统计</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>}

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