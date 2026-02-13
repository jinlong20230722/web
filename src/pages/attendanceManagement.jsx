// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, Calendar, Filter, Download, Eye, MapPin, Clock, User, Phone } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogHeader, DialogTitle, useToast } from '@/components/ui';

import { AttendanceDetailModal } from '@/components/AttendanceDetailModal';
import { mergeDataWithReference } from '@/lib/utils.js';
export default function AttendanceManagement(props) {
  const {
    toast
  } = useToast();
  const [data, setData] = useState([]);
  const [personnelData, setPersonnelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    name: '',
    department: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [sortField, setSortField] = useState('check_in_time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const where = {};

      // 日期范围筛选
      if (filters.startDate) {
        where.check_in_time = {
          $gte: new Date(filters.startDate).getTime()
        };
      }
      if (filters.endDate) {
        if (!where.check_in_time) {
          where.check_in_time = {};
        }
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.check_in_time.$lte = endDate.getTime();
      }

      // 模糊搜索
      if (searchTerm && !filters.name && !filters.department) {
        where.$or = [{
          address: {
            $regex: searchTerm
          }
        }];
      }

      // 加载打卡签到数据
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'attendance',
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
        phone: 'phone',
        department: 'department'
      });

      // 姓名筛选
      let filteredData = mergedData;
      if (filters.name) {
        filteredData = mergedData.filter(record => record.name && record.name.includes(filters.name));
      }

      // 部门筛选
      if (filters.department) {
        filteredData = filteredData.filter(record => record.department && record.department.includes(filters.department));
      }
      setData(filteredData);
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

  // 导出 Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const where = {};

      // 日期范围筛选
      if (filters.startDate) {
        where.check_in_time = {
          $gte: new Date(filters.startDate).getTime()
        };
      }
      if (filters.endDate) {
        if (!where.check_in_time) {
          where.check_in_time = {};
        }
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.check_in_time.$lte = endDate.getTime();
      }
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'attendance',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where
          },
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 10000,
          pageNumber: 1,
          orderBy: [{
            check_in_time: 'desc'
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
      const records = result.records || [];

      // 使用优化后的数据关联函数
      const mergedRecords = mergeDataWithReference(records, personnelData, 'personnel_id', '_id', {
        name: 'name',
        phone: 'phone',
        department: 'department'
      });

      // 姓名筛选
      let filteredRecords = mergedRecords;
      if (filters.name) {
        filteredRecords = mergedRecords.filter(record => record.name && record.name.includes(filters.name));
      }

      // 部门筛选
      if (filters.department) {
        filteredRecords = filteredRecords.filter(record => record.department && record.department.includes(filters.department));
      }

      // 构建 Excel 数据
      const excelData = filteredRecords.map(record => ({
        '姓名': record.name,
        '电话': record.phone,
        '打卡时间': new Date(record.check_in_time).toLocaleString('zh-CN'),
        '打卡地址': record.address,
        '打卡状态': record.status
      }));

      // 创建 CSV 内容
      const headers = Object.keys(excelData[0] || {}).join(',');
      const rows = excelData.map(row => Object.values(row).map(v => `"${v}"`).join(',')).join('\n');
      const csvContent = `\uFEFF${headers}\n${rows}`;

      // 下载文件
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `打卡签到记录_${new Date().toLocaleDateString('zh-CN')}.csv`;
      link.click();
      toast({
        title: '导出成功',
        description: `已导出 ${filteredRecords.length} 条记录`
      });
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: error.message || '导出失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  // 查看详情
  const handleViewDetail = record => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
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

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      name: '',
      department: ''
    });
    setSearchTerm('');
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };
  useEffect(() => {
    loadData();
  }, [pagination.page, sortField, sortOrder]);
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">打卡签到管理</h1>
          <p className="text-slate-600">查看和管理员工打卡签到记录</p>
        </div>

        {/* 筛选区域 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">筛选条件</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">开始日期</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({
                ...prev,
                startDate: e.target.value
              }))} className="pl-10" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">结束日期</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({
                ...prev,
                endDate: e.target.value
              }))} className="pl-10" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">人员姓名</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="输入姓名" value={filters.name} onChange={e => setFilters(prev => ({
                ...prev,
                name: e.target.value
              }))} className="pl-10" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">所属部门</Label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="输入部门" value={filters.department} onChange={e => setFilters(prev => ({
                ...prev,
                department: e.target.value
              }))} className="pl-10" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={loadData} className="bg-slate-600 hover:bg-slate-700">
              <Search className="w-4 h-4 mr-2" />
              查询
            </Button>
            <Button onClick={handleResetFilters} variant="outline">
              重置
            </Button>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="搜索姓名、电话、地址..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyPress={e => e.key === 'Enter' && loadData()} className="pl-10" />
          </div>
          <Button onClick={handleExportExcel} disabled={exporting} className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            {exporting ? '导出中...' : '导出 Excel'}
          </Button>
        </div>

        {/* 数据表格 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    姓名
                    {sortField === 'name' && <span className="text-xs text-slate-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort('phone')}>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    电话
                    {sortField === 'phone' && <span className="text-xs text-slate-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort('check_in_time')}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    打卡时间
                    {sortField === 'check_in_time' && <span className="text-xs text-slate-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort('address')}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    打卡地址
                    {sortField === 'address' && <span className="text-xs text-slate-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    打卡状态
                    {sortField === 'status' && <span className="text-xs text-slate-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>}
                  </div>
                </TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </TableCell>
                </TableRow> : data.length === 0 ? <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    暂无数据
                  </TableCell>
                </TableRow> : data.map(record => <TableRow key={record._id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>{record.phone}</TableCell>
                    <TableCell>
                      {new Date(record.check_in_time).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{record.address}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === '正常' ? 'bg-emerald-100 text-emerald-700' : record.status === '迟到' ? 'bg-amber-100 text-amber-700' : record.status === '早退' ? 'bg-orange-100 text-orange-700' : record.status === '缺卡' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(record)} className="text-slate-600 hover:text-slate-700 hover:bg-slate-50">
                        <Eye className="w-4 h-4 mr-1" />
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>)}
            </TableBody>
          </Table>

          {/* 分页 */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-slate-600">
              共 {pagination.total} 条记录，第 {pagination.page} 页
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({
              ...prev,
              page: prev.page - 1
            }))} disabled={pagination.page === 1}>
                上一页
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({
              ...prev,
              page: prev.page + 1
            }))} disabled={pagination.page * pagination.pageSize >= pagination.total}>
                下一页
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 详情弹窗 */}
      <AttendanceDetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} record={selectedRecord} />
    </div>;
}