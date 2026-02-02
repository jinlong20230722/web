// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Upload, TrendingUp, Calendar, Filter, RotateCcw, Users, UserCheck, UserX, UserPlus, BarChart3, PieChart as PieChartIcon, LineChartIcon } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { getRecords, createRecord, updateRecord, deleteRecord, formatDate } from '@/lib/dataSource';
export default function Personnel(props) {
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [personnel, setPersonnel] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');
  const [chartType, setChartType] = useState('status');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    position: '',
    status: '在职',
    idCard: '',
    address: '',
    age: '',
    gender: '男',
    emergencyName: '',
    emergencyPhone: ''
  });

  // 加载人员数据
  const loadPersonnel = async () => {
    setLoading(true);
    try {
      const result = await getRecords('EmployeeRegister', {}, 100, 1, [{
        createdAt: 'desc'
      }]);
      if (result && result.records) {
        setPersonnel(result.records);
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载人员数据失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadPersonnel();
  }, []);
  const columns = [{
    key: 'index',
    label: '序号',
    render: (value, row, index) => index + 1
  }, {
    key: 'name',
    label: '姓名'
  }, {
    key: 'gender',
    label: '性别'
  }, {
    key: 'age',
    label: '年龄'
  }, {
    key: 'phone',
    label: '联系电话'
  }, {
    key: 'department',
    label: '所属部门'
  }, {
    key: 'position',
    label: '职位'
  }, {
    key: 'createdAt',
    label: '入职日期',
    render: value => formatDate(value)
  }, {
    key: 'status',
    label: '状态',
    render: value => <span className={`px-2 py-1 rounded-full text-xs ${value === '在职' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {value === '在职' ? '在职' : '离职'}
        </span>
  }];
  const filterOptions = [{
    value: 'all',
    label: '全部状态'
  }, {
    value: '在职',
    label: '在职'
  }, {
    value: '离职',
    label: '离职'
  }];

  // 获取部门列表
  const departmentOptions = [{
    value: 'all',
    label: '全部部门'
  }, ...Array.from(new Set(personnel.map(p => p.department).filter(Boolean))).map(dept => ({
    value: dept,
    label: dept
  }))];

  // 获取职位列表
  const positionOptions = [{
    value: 'all',
    label: '全部职位'
  }, ...Array.from(new Set(personnel.map(p => p.position).filter(Boolean))).map(pos => ({
    value: pos,
    label: pos
  }))];

  // 准备图表数据
  const getChartData = () => {
    const statusCount = filteredData.reduce((acc, item) => {
      const status = item.status === '在职' ? '在职' : '离职';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  // 准备部门分布数据
  const getDepartmentData = () => {
    const deptCount = filteredData.reduce((acc, item) => {
      if (item.department) {
        acc[item.department] = (acc[item.department] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(deptCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  // 准备职位分布数据
  const getPositionData = () => {
    const posCount = filteredData.reduce((acc, item) => {
      if (item.position) {
        acc[item.position] = (acc[item.position] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(posCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  // 准备入职趋势数据
  const getJoinTrendData = () => {
    const monthlyCount = filteredData.reduce((acc, item) => {
      if (item.createdAt) {
        const date = new Date(item.createdAt);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(monthlyCount).map(([month, count]) => ({
      month,
      count
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  // 导出 CSV
  const handleExportCSV = () => {
    const headers = ['序号', '姓名', '性别', '年龄', '联系电话', '所属部门', '职位', '入职日期', '状态', '身份证号', '地址', '紧急联系人', '紧急联系电话'];
    const csvContent = [headers.join(','), ...filteredData.map((item, index) => [index + 1, item.name || '', item.gender || '', item.age || '', item.phone || '', item.department || '', item.position || '', formatDate(item.createdAt) || '', item.status || '', item.idCard || '', item.address || '', item.emergencyName || '', item.emergencyPhone || ''].map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `人员信息_${new Date().toLocaleDateString('zh-CN')}.csv`;
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
          if (cleanValues.length >= 5) {
            try {
              const data = {
                name: cleanValues[1] || '',
                gender: cleanValues[2] || '男',
                age: cleanValues[3] || '',
                phone: cleanValues[4] || '',
                department: cleanValues[5] || '',
                position: cleanValues[6] || '',
                status: cleanValues[8] || '在职',
                idCard: cleanValues[9] || '',
                address: cleanValues[10] || '',
                emergencyName: cleanValues[11] || '',
                emergencyPhone: cleanValues[12] || ''
              };
              await createRecord('EmployeeRegister', data);
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
        loadPersonnel();
      } catch (error) {
        toast({
          title: '导入失败',
          description: error.message || '导入 CSV 文件失败',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // 重置文件输入
  };

  // 重置筛选
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setStartDate('');
    setEndDate('');
    setFilterDepartment('all');
    setFilterPosition('all');
    toast({
      title: '筛选已重置',
      description: '所有筛选条件已清除'
    });
  };

  // 图表颜色配置
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const filteredData = personnel.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.phone?.includes(searchTerm) || item.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === '在职' && item.status === '在职' || filterStatus === '离职' && item.status === '离职';

    // 时间范围筛选
    let matchesDateRange = true;
    if (startDate && item.createdAt) {
      const itemDate = new Date(item.createdAt).setHours(0, 0, 0, 0);
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      matchesDateRange = matchesDateRange && itemDate >= start;
    }
    if (endDate && item.createdAt) {
      const itemDate = new Date(item.createdAt).setHours(23, 59, 59, 999);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      matchesDateRange = matchesDateRange && itemDate <= end;
    }

    // 部门筛选
    let matchesDepartment = true;
    if (filterDepartment !== 'all') {
      matchesDepartment = item.department === filterDepartment;
    }

    // 职位筛选
    let matchesPosition = true;
    if (filterPosition !== 'all') {
      matchesPosition = item.position === filterPosition;
    }
    return matchesSearch && matchesFilter && matchesDateRange && matchesDepartment && matchesPosition;
  });
  const handleAdd = () => {
    setEditingPerson(null);
    setFormData({
      name: '',
      phone: '',
      department: '',
      position: '',
      status: '在职',
      idCard: '',
      address: '',
      age: '',
      gender: '男',
      emergencyName: '',
      emergencyPhone: ''
    });
    setIsDialogOpen(true);
  };
  const handleEdit = item => {
    setEditingPerson(item);
    setFormData({
      name: item.name || '',
      phone: item.phone || '',
      department: item.department || '',
      position: item.position || '',
      status: item.status || '在职',
      idCard: item.idCard || '',
      address: item.address || '',
      age: item.age || '',
      gender: item.gender || '男',
      emergencyName: item.emergencyName || '',
      emergencyPhone: item.emergencyPhone || ''
    });
    setIsDialogOpen(true);
  };
  const handleDelete = async item => {
    if (confirm('确定要删除该人员吗？')) {
      try {
        await deleteRecord('EmployeeRegister', {
          $and: [{
            _id: {
              $eq: item._id
            }
          }]
        });
        toast({
          title: '删除成功',
          description: '人员信息已删除'
        });
        loadPersonnel();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除人员信息失败',
          variant: 'destructive'
        });
      }
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        position: formData.position,
        status: formData.status,
        idCard: formData.idCard,
        address: formData.address,
        age: formData.age,
        gender: formData.gender,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone
      };
      if (editingPerson) {
        await updateRecord('EmployeeRegister', data, {
          $and: [{
            _id: {
              $eq: editingPerson._id
            }
          }]
        });
        toast({
          title: '更新成功',
          description: '人员信息已更新'
        });
      } else {
        await createRecord('EmployeeRegister', data);
        toast({
          title: '添加成功',
          description: '人员信息已添加'
        });
      }
      setIsDialogOpen(false);
      loadPersonnel();
    } catch (error) {
      toast({
        title: editingPerson ? '更新失败' : '添加失败',
        description: error.message || '操作失败',
        variant: 'destructive'
      });
    }
  };
  return <PageLayout currentPage="personnel" onPageChange={pageId => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {}
    });
  }} title="人员信息管理" subtitle="管理保安人员基本信息" user={props.$w?.auth?.currentUser}>
      {/* 统计概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">总人数</p>
              <p className="text-white text-3xl font-bold">{personnel.length}</p>
              <p className="text-blue-200 text-xs mt-2">全部人员</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">在职人数</p>
              <p className="text-white text-3xl font-bold">{personnel.filter(p => p.status === '在职').length}</p>
              <p className="text-green-200 text-xs mt-2">正常工作</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium mb-1">离职人数</p>
              <p className="text-white text-3xl font-bold">{personnel.filter(p => p.status !== '在职').length}</p>
              <p className="text-gray-200 text-xs mt-2">已离职</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <UserX className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">本月入职</p>
              <p className="text-white text-3xl font-bold">{personnel.filter(p => {
                if (!p.createdAt) return false;
                const joinDate = new Date(p.createdAt);
                const now = new Date();
                return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
              }).length}</p>
              <p className="text-orange-200 text-xs mt-2">新入职人员</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮区域 */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          + 添加人员
        </Button>
        <div className="w-px h-8 bg-gray-300 mx-2" />
        <Button onClick={() => setShowChart(!showChart)} variant="outline" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {showChart ? '返回列表' : '统计图表'}
        </Button>
        <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          导出 CSV
        </Button>
        <div className="relative">
          <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" id="csv-import" />
          <Button onClick={() => document.getElementById('csv-import').click()} variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            导入 CSV
          </Button>
        </div>
        <div className="w-px h-8 bg-gray-300 mx-2" />
        <Button onClick={handleResetFilters} variant="outline" size="sm" className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          重置筛选
        </Button>
      </div>

      {/* 筛选区域 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-lg mb-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-700">筛选条件</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              入职日期开始
            </label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              入职日期结束
            </label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              所属部门
            </label>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              职位
            </label>
            <Select value={filterPosition} onValueChange={setFilterPosition}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 图表视图 */}
      {showChart ? <div className="space-y-4">
          {/* 图表类型切换 */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setChartType('status')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${chartType === 'status' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <PieChartIcon className="w-4 h-4" />
              状态分布
            </button>
            <button onClick={() => setChartType('department')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${chartType === 'department' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <BarChart3 className="w-4 h-4" />
              部门分布
            </button>
            <button onClick={() => setChartType('position')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${chartType === 'position' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <BarChart3 className="w-4 h-4" />
              职位分布
            </button>
            <button onClick={() => setChartType('trend')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${chartType === 'trend' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <LineChartIcon className="w-4 h-4" />
              入职趋势
            </button>
          </div>

          {/* 图表展示区域 */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {chartType === 'status' && <>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                  人员状态分布
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={getChartData()} cx="50%" cy="50%" labelLine={false} label={entry => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                      {getChartData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </>}
            {chartType === 'department' && <>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  部门人员分布
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={getDepartmentData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{
                fontSize: 12
              }} />
                    <YAxis tick={{
                fontSize: 12
              }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>}
            {chartType === 'position' && <>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  职位人员分布
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={getPositionData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{
                fontSize: 12
              }} />
                    <YAxis tick={{
                fontSize: 12
              }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>}
            {chartType === 'trend' && <>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-blue-600" />
                  入职趋势
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={getJoinTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{
                fontSize: 12
              }} />
                    <YAxis tick={{
                fontSize: 12
              }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={3} dot={{
                r: 5
              }} activeDot={{
                r: 7
              }} />
                  </LineChart>
                </ResponsiveContainer>
              </>}
          </div>
        </div> : (/* 列表视图 */
    <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              人员列表
              <span className="text-sm font-normal text-gray-500 ml-2">（共 {filteredData.length} 条记录）</span>
            </h3>
          </div>
          <DataTable columns={columns} data={filteredData} onEdit={handleEdit} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />
        </>)}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPerson ? '编辑人员' : '添加人员'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名 *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({
                  ...formData,
                  name: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">联系电话 *</Label>
                  <Input id="phone" value={formData.phone} onChange={e => setFormData({
                  ...formData,
                  phone: e.target.value
                })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">所属部门 *</Label>
                  <Input id="department" value={formData.department} onChange={e => setFormData({
                  ...formData,
                  department: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">职位 *</Label>
                  <Input id="position" value={formData.position} onChange={e => setFormData({
                  ...formData,
                  position: e.target.value
                })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idCard">身份证号</Label>
                <Input id="idCard" value={formData.idCard} onChange={e => setFormData({
                ...formData,
                idCard: e.target.value
              })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">地址</Label>
                <Input id="address" value={formData.address} onChange={e => setFormData({
                ...formData,
                address: e.target.value
              })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">性别</Label>
                  <Select value={formData.gender} onValueChange={value => setFormData({
                  ...formData,
                  gender: value
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">年龄</Label>
                  <Input id="age" value={formData.age} onChange={e => setFormData({
                  ...formData,
                  age: e.target.value
                })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">紧急联系人</Label>
                  <Input id="emergencyName" value={formData.emergencyName} onChange={e => setFormData({
                  ...formData,
                  emergencyName: e.target.value
                })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">紧急联系电话</Label>
                  <Input id="emergencyPhone" value={formData.emergencyPhone} onChange={e => setFormData({
                  ...formData,
                  emergencyPhone: e.target.value
                })} />
                </div>
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
                    <SelectItem value="在职">在职</SelectItem>
                    <SelectItem value="离职">离职</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingPerson ? '更新' : '添加'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>;
}