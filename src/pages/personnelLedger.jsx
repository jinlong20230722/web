// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, Filter, Eye, Edit, UserX, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import PersonnelDetailModal from '@/components/PersonnelDetailModal';
import PersonnelEditModal from '@/components/PersonnelEditModal';
export default function PersonnelLedger(props) {
  const {
    toast
  } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    phone: '',
    department: '',
    position: '',
    employment_status: ''
  });
  const [sortField, setSortField] = useState('register_time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const where = {};

      // 构建查询条件
      if (filters.name) where.name = {
        $regex: filters.name
      };
      if (filters.phone) where.phone = {
        $regex: filters.phone
      };
      if (filters.department) where.department = filters.department;
      if (filters.position) where.position = filters.position;
      if (filters.employment_status) where.employment_status = filters.employment_status;

      // 模糊搜索
      if (searchTerm && !filters.name && !filters.phone) {
        where.$or = [{
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
        }, {
          position: {
            $regex: searchTerm
          }
        }];
      }
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
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
  }, [pagination.page, sortOrder, sortField]);

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    loadData();
  };

  // 筛选处理
  const handleFilter = () => {
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    loadData();
    setShowFilters(false);
  };

  // 重置筛选
  const handleResetFilter = () => {
    setFilters({
      name: '',
      phone: '',
      department: '',
      position: '',
      employment_status: ''
    });
    setSearchTerm('');
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    loadData();
    setShowFilters(false);
  };

  // 排序处理
  const handleSort = field => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 查看详情
  const handleViewDetail = record => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  // 编辑
  const handleEdit = record => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  // 标记离职
  const handleMarkResign = async record => {
    if (!confirm(`确定要将 ${record.name} 标记为离职吗？`)) return;
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'markResignation',
        data: {
          personnelId: record._id
        }
      });
      if (result.success) {
        toast({
          title: '操作成功',
          description: result.message || `${record.name} 已标记为离职`
        });
        loadData();
      } else {
        toast({
          title: '操作失败',
          description: result.message || '标记离职失败，请重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('标记离职失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '标记离职失败，请重试',
        variant: 'destructive'
      });
    }
  };

  // 获取排序图标
  const getSortIcon = field => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
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
      case '在职':
        return 'bg-green-100 text-green-800';
      case '离职':
        return 'bg-red-100 text-red-800';
      case '试用期':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div className="flex min-h-screen bg-gray-50">
      {/* 左侧导航栏 */}
      <Sidebar currentPage="personnelLedger" $w={props.$w} />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部标题栏 */}
        <TopNav currentUser={props.$w.auth.currentUser} />

        {/* 页面内容 */}
        <div className="p-6">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">人员台账管理</h1>
            <p className="text-gray-600 mt-1">查看和管理所有人员信息</p>
          </div>

      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4 items-center">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input placeholder="搜索姓名、电话、部门或职务..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} className="pl-10" />
          </div>
          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
            <Search className="w-4 h-4 mr-2" />
            搜索
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'bg-blue-50 border-blue-300' : ''}>
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </Button>
          {Object.values(filters).some(v => v) || searchTerm ? <Button variant="ghost" onClick={handleResetFilter}>
              重置
            </Button> : null}
        </div>

        {/* 筛选条件 */}
        {showFilters && <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <Input placeholder="输入姓名" value={filters.name} onChange={e => setFilters(prev => ({
                ...prev,
                name: e.target.value
              }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
              <Input placeholder="输入电话" value={filters.phone} onChange={e => setFilters(prev => ({
                ...prev,
                phone: e.target.value
              }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所属部门</label>
              <Input placeholder="输入部门" value={filters.department} onChange={e => setFilters(prev => ({
                ...prev,
                department: e.target.value
              }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">职务</label>
              <Input placeholder="输入职务" value={filters.position} onChange={e => setFilters(prev => ({
                ...prev,
                position: e.target.value
              }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">在职状态</label>
              <Select value={filters.employment_status} onValueChange={value => setFilters(prev => ({
                ...prev,
                employment_status: value
              }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="在职">在职</SelectItem>
                  <SelectItem value="离职">离职</SelectItem>
                  <SelectItem value="试用期">试用期</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-5 flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={handleResetFilter}>重置</Button>
              <Button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700">应用筛选</Button>
            </div>
          </div>}
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    姓名
                    {getSortIcon('name')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('phone')}>
                  <div className="flex items-center gap-2">
                    电话
                    {getSortIcon('phone')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('department')}>
                  <div className="flex items-center gap-2">
                    所属部门
                    {getSortIcon('department')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('position')}>
                  <div className="flex items-center gap-2">
                    职务
                    {getSortIcon('position')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('employment_status')}>
                  <div className="flex items-center gap-2">
                    在职状态
                    {getSortIcon('employment_status')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('register_time')}>
                  <div className="flex items-center gap-2">
                    入职登记时间
                    {getSortIcon('register_time')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    加载中...
                  </td>
                </tr> : data.length === 0 ? <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr> : data.map(record => <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.department || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.position || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(record.employment_status)}`}>
                        {record.employment_status || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatTime(record.register_time)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(record)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(record)} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {record.employment_status === '在职' && <Button variant="ghost" size="sm" onClick={() => handleMarkResign(record)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <UserX className="w-4 h-4" />
                          </Button>}
                      </div>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            共 {pagination.total} 条记录，第 {pagination.page} 页
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({
                ...prev,
                page: prev.page - 1
              }))} disabled={pagination.page <= 1}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一页
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({
                ...prev,
                page: prev.page + 1
              }))} disabled={pagination.page * pagination.pageSize >= pagination.total}>
              下一页
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* 详情弹窗 */}
      {showDetailModal && <PersonnelDetailModal record={selectedRecord} onClose={() => setShowDetailModal(false)} onEdit={() => {
          setShowDetailModal(false);
          setShowEditModal(true);
        }} />}

      {/* 编辑弹窗 */}
      {showEditModal && <PersonnelEditModal record={selectedRecord} onClose={() => setShowEditModal(false)} onSuccess={() => {
          setShowEditModal(false);
          loadData();
        }} $w={props.$w} />}
        </div>
      </div>
    </div>;
}