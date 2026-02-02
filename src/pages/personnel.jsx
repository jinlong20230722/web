// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Filter } from 'lucide-react';

import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { PersonnelStats } from '@/components/PersonnelStats';
import { PersonnelFilters } from '@/components/PersonnelFilters';
import { PersonnelCharts } from '@/components/PersonnelCharts';
import { PersonnelForm } from '@/components/PersonnelForm';
import { PersonnelActions } from '@/components/PersonnelActions';
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

  // 加载人员数据 - 从 EmployeeRegister 数据模型获取
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

  // 表格列定义 - 基于 EmployeeRegister 数据模型字段
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

  // 获取部门列表 - 从 EmployeeRegister 数据模型动态生成
  const departmentOptions = [{
    value: 'all',
    label: '全部部门'
  }, ...Array.from(new Set(personnel.map(p => p.department).filter(Boolean))).map(dept => ({
    value: dept,
    label: dept
  }))];

  // 获取职位列表 - 从 EmployeeRegister 数据模型动态生成
  const positionOptions = [{
    value: 'all',
    label: '全部职位'
  }, ...Array.from(new Set(personnel.map(p => p.position).filter(Boolean))).map(pos => ({
    value: pos,
    label: pos
  }))];

  // 准备图表数据 - 基于 EmployeeRegister 数据模型
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

  // 导出 CSV - 基于 EmployeeRegister 数据模型字段
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

  // 导入 CSV - 基于 EmployeeRegister 数据模型字段
  const handleImportCSV = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').slice(1);
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
    e.target.value = '';
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

  // 数据筛选逻辑 - 基于 EmployeeRegister 数据模型字段
  const filteredData = personnel.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.phone?.includes(searchTerm) || item.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === '在职' && item.status === '在职' || filterStatus === '离职' && item.status === '离职';

    // 时间范围筛选 - 使用 createdAt 字段
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

  // 添加人员
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

  // 编辑人员
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

  // 删除人员 - 从 EmployeeRegister 数据模型删除
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

  // 提交表单 - 保存到 EmployeeRegister 数据模型
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
      {/* 统计概览卡片 - 基于 EmployeeRegister 数据模型 */}
      <PersonnelStats personnel={personnel} />

      {/* 操作按钮区域 */}
      <PersonnelActions onAdd={handleAdd} onToggleChart={() => setShowChart(!showChart)} showChart={showChart} onExportCSV={handleExportCSV} onResetFilters={handleResetFilters} />

      {/* 筛选区域 - 基于 EmployeeRegister 数据模型字段 */}
      <PersonnelFilters startDate={startDate} endDate={endDate} filterDepartment={filterDepartment} filterPosition={filterPosition} setStartDate={setStartDate} setEndDate={setEndDate} setFilterDepartment={setFilterDepartment} setFilterPosition={setFilterPosition} departmentOptions={departmentOptions} positionOptions={positionOptions} />

      {/* 图表视图 - 基于 EmployeeRegister 数据模型 */}
      {showChart ? <PersonnelCharts chartType={chartType} setChartType={setChartType} getChartData={getChartData} getDepartmentData={getDepartmentData} getPositionData={getPositionData} getJoinTrendData={getJoinTrendData} /> : (/* 列表视图 */
    <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              人员列表
              <span className="text-sm font-normal text-gray-500 ml-2">
                （共 {filteredData.length} 条记录）
              </span>
            </h3>
          </div>
          <DataTable columns={columns} data={filteredData} onEdit={handleEdit} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />
        </>)}

      {/* 人员表单对话框 - 基于 EmployeeRegister 数据模型字段 */}
      <PersonnelForm isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} editingPerson={editingPerson} formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} />
    </PageLayout>;
}