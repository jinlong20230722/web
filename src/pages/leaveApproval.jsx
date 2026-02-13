// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, Calendar, Filter, Check, X, Eye } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Label, Textarea, useToast } from '@/components/ui';

import { Badge } from '@/components/Badge';
import LeaveApprovalModal from '@/components/LeaveApprovalModal';
export default function LeaveApproval(props) {
  const {
    toast
  } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('待审批');
  const [filters, setFilters] = useState({
    department: '',
    name: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [sortField, setSortField] = useState('submit_time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [approvalRemark, setApprovalRemark] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 获取当前用户信息
  const currentUser = props.$w.auth.currentUser || {};
  const userDepartment = currentUser.department || '';
  const userRole = currentUser.type || '';
  const isHR = userRole === '人事部' || userRole === 'admin';

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const where = {
        $and: []
      };

      // 审批状态筛选
      if (activeTab === '待审批') {
        where.$and.push({
          approval_status: '待审批'
        });
      } else if (activeTab === '已通过') {
        where.$and.push({
          approval_status: '已通过'
        });
      } else if (activeTab === '已驳回') {
        where.$and.push({
          approval_status: '已驳回'
        });
      }

      // 部门筛选（部门部长只能看本部门，人事部可以看全部）
      if (!isHR && userDepartment) {
        where.$and.push({
          department: userDepartment
        });
      } else if (filters.department) {
        where.$and.push({
          department: filters.department
        });
      }

      // 姓名筛选
      if (filters.name) {
        where.$and.push({
          name: {
            $regex: filters.name
          }
        });
      }

      // 时间范围筛选
      if (filters.startDate) {
        where.$and.push({
          start_time: {
            $gte: new Date(filters.startDate).getTime()
          }
        });
      }
      if (filters.endDate) {
        where.$and.push({
          end_time: {
            $lte: new Date(filters.endDate).getTime()
          }
        });
      }

      // 模糊搜索
      if (searchTerm && !filters.name) {
        where.$and.push({
          $or: [{
            name: {
              $regex: searchTerm
            }
          }, {
            phone: {
              $regex: searchTerm
            }
          }, {
            department: {
              $regex: searchTerm
            }
          }]
        });
      }
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'leave_request',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: pagination.pageSize,
          pageNumber: pagination.page,
          orderBy: [{
            [sortField]: sortOrder
          }]
        }
      });
      setData(result.records || []);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0
      }));
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '加载数据失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, [activeTab, pagination.page, sortField, sortOrder]);

  // 处理搜索
  const handleSearch = () => {
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    loadData();
  };

  // 处理筛选
  const handleFilter = () => {
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    loadData();
  };

  // 重置筛选
  const handleResetFilter = () => {
    setFilters({
      department: '',
      name: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    loadData();
  };

  // 排序
  const handleSort = field => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 打开审批弹窗
  const openApprovalModal = (record, action) => {
    setSelectedRecord(record);
    setApprovalAction(action);
    setApprovalRemark('');
    setShowApprovalModal(true);
  };

  // 提交审批
  const handleApprovalSubmit = async () => {
    if (!approvalRemark.trim()) {
      toast({
        title: '请填写审批备注',
        description: '审批备注不能为空',
        variant: 'destructive'
      });
      return;
    }
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'leave_request',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            approval_status: approvalAction === 'approve' ? '已通过' : '已驳回',
            approval_remark: approvalRemark,
            approval_time: Date.now(),
            approver_name: currentUser.name || '管理员'
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
      if (result.count > 0) {
        toast({
          title: '审批成功',
          description: `已${approvalAction === 'approve' ? '通过' : '驳回'}${selectedRecord.name}的请假申请`
        });
        setShowApprovalModal(false);
        loadData();
      } else {
        toast({
          title: '审批失败',
          description: '审批失败，请重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('审批失败:', error);
      toast({
        title: '审批失败',
        description: error.message || '审批失败，请重试',
        variant: 'destructive'
      });
    }
  };

  // 查看详情
  const handleViewDetail = record => {
    setSelectedRecord(record);
    setShowDetailModal(true);
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

  // 获取状态颜色
  const getStatusColor = status => {
    switch (status) {
      case '待审批':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case '已通过':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case '已驳回':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">请销假审批管理</h1>
              <p className="text-sm text-slate-500 mt-1">管理员工请假申请审批流程</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span>当前部门：</span>
              <span className="font-medium text-slate-800">{isHR ? '人事部（全部权限）' : userDepartment || '未设置'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 状态标签页 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex space-x-1 p-2">
            {['待审批', '已通过', '已驳回'].map(tab => <button key={tab} onClick={() => {
            setActiveTab(tab);
            setPagination(prev => ({
              ...prev,
              page: 1
            }));
          }} className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === tab ? 'bg-slate-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                {tab}
              </button>)}
          </div>
        </div>

        {/* 筛选区域 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">筛选条件</h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">人员姓名</Label>
              <Input placeholder="输入姓名" value={filters.name} onChange={e => setFilters({
              ...filters,
              name: e.target.value
            })} className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">所属部门</Label>
              <Input placeholder="输入部门" value={filters.department} onChange={e => setFilters({
              ...filters,
              department: e.target.value
            })} className="mt-1" disabled={!isHR} />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">开始日期</Label>
              <Input type="date" value={filters.startDate} onChange={e => setFilters({
              ...filters,
              startDate: e.target.value
            })} className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">结束日期</Label>
              <Input type="date" value={filters.endDate} onChange={e => setFilters({
              ...filters,
              endDate: e.target.value
            })} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4">
            <Button onClick={handleFilter} className="bg-slate-600 hover:bg-slate-700">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
            <Button onClick={handleResetFilter} variant="outline">
              重置
            </Button>
          </div>
        </div>

        {/* 搜索区域 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input placeholder="搜索姓名、电话、部门..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} className="pl-10" />
            </div>
            <Button onClick={handleSearch} className="bg-slate-600 hover:bg-slate-700">
              <Search className="w-4 h-4 mr-2" />
              搜索
            </Button>
          </div>
        </div>

        {/* 数据表格 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[{
                  field: 'name',
                  label: '姓名'
                }, {
                  field: 'department',
                  label: '部门'
                }, {
                  field: 'position',
                  label: '职务'
                }, {
                  field: 'start_time',
                  label: '请假开始时间'
                }, {
                  field: 'end_time',
                  label: '请假结束时间'
                }, {
                  field: 'approval_status',
                  label: '审批状态'
                }, {
                  field: 'actions',
                  label: '操作'
                }].map(col => <th key={col.field} onClick={() => col.field !== 'actions' && handleSort(col.field)} className={`px-6 py-4 text-left text-sm font-semibold text-slate-700 ${col.field !== 'actions' ? 'cursor-pointer hover:bg-slate-100' : ''}`}>
                      <div className="flex items-center space-x-1">
                        <span>{col.label}</span>
                        {sortField === col.field && <span className="text-blue-600">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>}
                      </div>
                    </th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      加载中...
                    </td>
                  </tr> : data.length === 0 ? <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      暂无数据
                    </td>
                  </tr> : data.map(record => <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{record.name}</div>
                        <div className="text-sm text-slate-500">{record.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{record.department}</td>
                      <td className="px-6 py-4 text-slate-700">{record.position}</td>
                      <td className="px-6 py-4 text-slate-700">{formatTime(record.start_time)}</td>
                      <td className="px-6 py-4 text-slate-700">{formatTime(record.end_time)}</td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(record.approval_status)}>
                          {record.approval_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetail(record)} className="text-slate-600 hover:text-slate-700 hover:bg-slate-50">
                            <Eye className="w-4 h-4 mr-1" />
                            详情
                          </Button>
                          {record.approval_status === '待审批' && <>
                              <Button size="sm" onClick={() => openApprovalModal(record, 'approve')} className="bg-emerald-600 hover:bg-emerald-700">
                                <Check className="w-4 h-4 mr-1" />
                                通过
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => openApprovalModal(record, 'reject')}>
                                <X className="w-4 h-4 mr-1" />
                                驳回
                              </Button>
                            </>}
                        </div>
                      </td>
                    </tr>)}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              共 {pagination.total} 条记录，第 {pagination.page} 页
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={() => setPagination(prev => ({
              ...prev,
              page: prev.page - 1
            }))} disabled={pagination.page === 1}>
                上一页
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPagination(prev => ({
              ...prev,
              page: prev.page + 1
            }))} disabled={pagination.page * pagination.pageSize >= pagination.total}>
                下一页
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 审批弹窗 */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {approvalAction === 'approve' ? '通过审批' : '驳回申请'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">申请人：</span>
                  <span className="font-medium text-slate-900 ml-2">{selectedRecord?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">部门：</span>
                  <span className="font-medium text-slate-900 ml-2">{selectedRecord?.department}</span>
                </div>
                <div>
                  <span className="text-slate-500">开始时间：</span>
                  <span className="font-medium text-slate-900 ml-2">{formatTime(selectedRecord?.start_time)}</span>
                </div>
                <div>
                  <span className="text-slate-500">结束时间：</span>
                  <span className="font-medium text-slate-900 ml-2">{formatTime(selectedRecord?.end_time)}</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-slate-500">请假原因：</span>
                <p className="text-slate-900 mt-1">{selectedRecord?.reason}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">
                审批备注 <span className="text-red-500">*</span>
              </Label>
              <Textarea placeholder="请输入审批备注..." value={approvalRemark} onChange={e => setApprovalRemark(e.target.value)} className="mt-1 min-h-[100px]" />
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleApprovalSubmit} className={`flex-1 ${approvalAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {approvalAction === 'approve' ? '确认通过' : '确认驳回'}
              </Button>
              <Button variant="outline" onClick={() => setShowApprovalModal(false)} className="flex-1">
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 详情弹窗 */}
      <LeaveApprovalModal record={selectedRecord} open={showDetailModal} onClose={() => setShowDetailModal(false)} />
    </div>;
}