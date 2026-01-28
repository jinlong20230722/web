// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Upload, TrendingUp, Calendar, Filter } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { getRecords, createRecord, updateRecord, deleteRecord, formatDate, formatTime } from '@/lib/dataSource';
export default function Attendance(props) {
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [formData, setFormData] = useState({
    personnelId: '',
    personnelName: '',
    address: '',
    status: '正常'
  });

  // 加载打卡数据
  const loadAttendance = async () => {
    setLoading(true);
    try {
      const result = await getRecords('attendance', {}, 100, 1, [{
        checkInTime: 'desc'
      }]);
      if (result && result.records) {
        setAttendance(result.records);
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载打卡数据失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAttendance();
  }, []);

  // 筛选数据
  const filteredData = attendance.filter(item => {
    const matchesSearch = item.personnelName?.toLowerCase().includes(searchTerm.toLowerCase()) || item.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === 'normal' && item.status === '正常' || filterStatus === 'abnormal' && item.status !== '正常';

    // 时间范围筛选
    let matchesDateRange = true;
    if (startDate && item.checkInTime) {
      const itemDate = new Date(item.checkInTime).setHours(0, 0, 0, 0);
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      matchesDateRange = matchesDateRange && itemDate >= start;
    }
    if (endDate && item.checkInTime) {
      const itemDate = new Date(item.checkInTime).setHours(23, 59, 59, 999);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      matchesDateRange = matchesDateRange && itemDate <= end;
    }

    // 数据类型筛选
    let matchesType = true;
    if (filterType !== 'all') {
      matchesType = filterType === 'normal' ? item.status === '正常' : item.status !== '正常';
    }
    return matchesSearch && matchesFilter && matchesDateRange && matchesType;
  });

  // 准备图表数据
  const getChartData = () => {
    const statusCount = filteredData.reduce((acc, item) => {
      const status = item.status === '正常' ? '正常' : '异常';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  // 准备每日打卡数据
  const getDailyData = () => {
    const dailyCount = filteredData.reduce((acc, item) => {
      if (item.checkInTime) {
        const date = new Date(item.checkInTime).toLocaleDateString('zh-CN');
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(dailyCount).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  const columns = [{
    key: 'index',
    label: '序号',
    render: (value, row, index) => index + 1
  }, {
    key: 'personnelName',
    label: '姓名'
  }, {
    key: 'personnelId',
    label: '人员ID'
  }, {
    key: 'address',
    label: '打卡地址'
  }, {
    key: 'checkInTime',
    label: '签到时间',
    render: value => formatDateTime(value)
  }, {
    key: 'status',
    label: '状态',
    render: value => <span className={`px-2 py-1 rounded-full text-xs ${value === '正常' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {value === '正常' ? '正常' : '异常'}
        </span>
  }];
  const filterOptions = [{
    value: 'all',
    label: '全部状态'
  }, {
    value: 'normal',
    label: '正常'
  }, {
    value: 'abnormal',
    label: '异常'
  }];
  const handleAdd = () => {
    setFormData({
      personnelId: '',
      personnelName: '',
      address: '',
      status: '正常'
    });
    setIsDialogOpen(true);
  };
  const handleDelete = async item => {
    if (confirm('确定要删除该打卡记录吗？')) {
      try {
        await deleteRecord('attendance', {
          $and: [{
            _id: {
              $eq: item._id
            }
          }]
        });
        toast({
          title: '删除成功',
          description: '打卡记录已删除'
        });
        loadAttendance();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除打卡记录失败',
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
        address: formData.address,
        status: formData.status,
        checkInTime: Date.now(),
        latitude: 0,
        longitude: 0,
        attachments: []
      };
      await createRecord('attendance', data);
      toast({
        title: '添加成功',
        description: '打卡记录已添加'
      });
      setIsDialogOpen(false);
      loadAttendance();
    } catch (error) {
      toast({
        title: '添加失败',
        description: error.message || '添加打卡记录失败',
        variant: 'destructive'
      });
    }
  };
  function formatDateTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // 导出 CSV
  const handleExportCSV = () => {
    const headers = ['序号', '姓名', '人员ID', '打卡地址', '签到时间', '状态'];
    const csvContent = [headers.join(','), ...filteredData.map((item, index) => [index + 1, item.personnelName || '', item.personnelId || '', item.address || '', formatDateTime(item.checkInTime), item.status || ''].map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `打卡记录_${new Date().toLocaleDateString('zh-CN')}.csv`;
    link.click();
    toast({
      title: '导出成功',
      description: 'CSV 文件已下载'
    });
  };

  // 导入 CSV
  const handleImportCSV = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').slice(1); // 跳过标题行
        let successCount = 0;
        let errorCount = 0;
        for (const line of lines) {
          if (!line.trim()) continue;
          const values = line.match(/("[^"]*")|([^,]+)/g) || [];
          const cleanValues = values.map(v => v.replace(/"/g, '').trim());
          if (cleanValues.length >= 3) {
            try {
              const data = {
                personnelId: cleanValues[2] || '',
                personnelName: cleanValues[1] || '',
                address: cleanValues[3] || '',
                status: cleanValues[5] || '正常',
                checkInTime: Date.now(),
                latitude: 0,
                longitude: 0,
                attachments: []
              };
              await createRecord('attendance', data);
              successCount++;
            } catch (err) {
              errorCount++;
            }
          }
        }
        toast({
          title: '导入完成',
          description: `成功导入 ${successCount} 条记录，失败 ${errorCount} 条`
        });
        loadAttendance();
      } catch (error) {
        toast({
          title: '导入失败',
          description: error.message || '解析 CSV 文件失败',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // 重置文件输入
  };
  const COLORS = ['#10B981', '#EF4444'];
  return <PageLayout currentPage="attendance" onPageChange={pageId => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {}
    });
  }} title="打卡签到管理" subtitle="查看和管理打卡记录" user={props.$w?.auth?.currentUser}>
      {/* 操作按钮区域 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          + 添加打卡
        </Button>
        
        <Button onClick={() => setShowChart(!showChart)} variant={showChart ? "default" : "outline"} className={showChart ? "bg-purple-600 hover:bg-purple-700" : ""}>
          <TrendingUp className="w-4 h-4 mr-2" />
          {showChart ? '查看列表' : '统计图表'}
        </Button>
        
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          导出 CSV
        </Button>
        
        <Button variant="outline" onClick={() => document.getElementById('csvInput')?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          导入 CSV
        </Button>
        <input id="csvInput" type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
      </div>

      {/* 筛选区域 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">时间范围：</span>
          </div>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
          <span className="text-gray-500">至</span>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
          
          <div className="flex items-center gap-2 ml-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">数据类型：</span>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="normal">正常</SelectItem>
              <SelectItem value="abnormal">异常</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => {
          setStartDate('');
          setEndDate('');
          setFilterType('all');
        }} variant="ghost" size="sm">
            重置筛选
          </Button>
        </div>
      </div>

      {/* 统计图表区域 */}
      {showChart && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 状态分布饼图 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">打卡状态分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={getChartData()} cx="50%" cy="50%" labelLine={false} label={({
              name,
              percent
            }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {getChartData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 每日打卡柱状图 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">每日打卡统计</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getDailyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="打卡次数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>}

      {/* 数据表格区域 */}
      {!showChart && <DataTable columns={columns} data={filteredData} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加打卡记录</DialogTitle>
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
                <Label htmlFor="address">打卡地址 *</Label>
                <Input id="address" value={formData.address} onChange={e => setFormData({
                ...formData,
                address: e.target.value
              })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select value={formData.status} onValueChange={value => setFormData({
                ...formData,
                status: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="正常">正常</SelectItem>
                    <SelectItem value="异常">异常</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                添加
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>;
}