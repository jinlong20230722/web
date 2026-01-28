// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    position: '',
    status: 'active',
    idNumber: '',
    address: ''
  });

  // 加载人员数据
  const loadPersonnel = async () => {
    setLoading(true);
    try {
      const result = await getRecords('personnel', {}, 100, 1, [{
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
    key: 'phone',
    label: '联系电话'
  }, {
    key: 'department',
    label: '所属部门'
  }, {
    key: 'position',
    label: '职位'
  }, {
    key: 'joinDate',
    label: '入职日期',
    render: value => formatDate(value)
  }, {
    key: 'status',
    label: '状态',
    render: value => <span className={`px-2 py-1 rounded-full text-xs ${value === '在职' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {value === '在职' ? '在职' : '离职'}
        </span>
  }];

  // 统计数据
  const departmentStats = () => {
    const stats = {};
    personnel.forEach(item => {
      const dept = item.department || '未分类';
      stats[dept] = (stats[dept] || 0) + 1;
    });
    return Object.keys(stats).map(key => ({
      name: key,
      count: stats[key]
    }));
  };
  const statusStats = () => {
    const stats = {
      '在职': 0,
      '离职': 0
    };
    personnel.forEach(item => {
      const status = item.status || '离职';
      stats[status] = (stats[status] || 0) + 1;
    });
    return Object.keys(stats).map(key => ({
      name: key,
      count: stats[key]
    }));
  };
  const COLORS = ['#3B82F6', '#9CA3AF'];

  // 导出 CSV
  const handleExportCSV = () => {
    const headers = ['序号', '姓名', '联系电话', '所属部门', '职位', '入职日期', '状态'];
    const csvContent = [headers.join(','), ...filteredData.map((item, index) => [index + 1, item.name || '', item.phone || '', item.department || '', item.position || '', formatDate(item.joinDate) || '', item.status || ''].map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `人员信息_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: '导出成功',
      description: '人员信息已导出为 CSV 文件'
    });
  };
  const filterOptions = [{
    value: 'all',
    label: '全部状态'
  }, {
    value: 'active',
    label: '在职'
  }, {
    value: 'inactive',
    label: '离职'
  }];
  const filteredData = personnel.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.phone?.includes(searchTerm) || item.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === 'active' && item.status === '在职' || filterStatus === 'inactive' && item.status !== '在职';
    return matchesSearch && matchesFilter;
  });
  const handleAdd = () => {
    setEditingPerson(null);
    setFormData({
      name: '',
      phone: '',
      department: '',
      position: '',
      status: 'active',
      idNumber: '',
      address: ''
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
      status: item.status === '在职' ? 'active' : 'inactive',
      idNumber: item.idCard || '',
      address: item.registeredResidence || ''
    });
    setIsDialogOpen(true);
  };
  const handleDelete = async item => {
    if (confirm('确定要删除该人员吗？')) {
      try {
        await deleteRecord('personnel', {
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
        status: formData.status === 'active' ? '在职' : '离职',
        idCard: formData.idNumber,
        registeredResidence: formData.address
      };
      if (editingPerson) {
        await updateRecord('personnel', data, {
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
        await createRecord('personnel', data);
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
      {/* 统计图表区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">部门人员分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentStats()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">人员状态分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusStats()} cx="50%" cy="50%" labelLine={false} label={({
              name,
              percent
            }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="count">
                {statusStats().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          + 添加人员
        </Button>
        <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          导出 CSV
        </Button>
      </div>

      <DataTable columns={columns} data={filteredData} onEdit={handleEdit} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />

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
                <Label htmlFor="idNumber">身份证号</Label>
                <Input id="idNumber" value={formData.idNumber} onChange={e => setFormData({
                ...formData,
                idNumber: e.target.value
              })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">户籍地址</Label>
                <Input id="address" value={formData.address} onChange={e => setFormData({
                ...formData,
                address: e.target.value
              })} />
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
                    <SelectItem value="active">在职</SelectItem>
                    <SelectItem value="inactive">离职</SelectItem>
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