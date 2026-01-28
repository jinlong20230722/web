// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { StatisticsChart } from '@/components/StatisticsChart';
import { StatCard } from '@/components/StatCard';
import { ExportUtils, DateRangePicker, filterByDateRange } from '@/components/ExportUtils';
import { getRecords, createRecord, updateRecord, deleteRecord, formatDate } from '@/lib/dataSource';
export default function Personnel(props) {
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
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
    key: '_id',
    label: 'ID'
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
  // 根据时间范围筛选数据
  const filteredByDate = filterByDateRange(personnel, dateRange, 'joinDate');
  const filteredData = filteredByDate.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.phone?.includes(searchTerm) || item.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === 'active' && item.status === '在职' || filterStatus === 'inactive' && item.status !== '在职';
    return matchesSearch && matchesFilter;
  });

  // 统计数据（基于筛选后的数据）
  const departmentStats = filteredByDate.reduce((acc, item) => {
    const dept = item.department || '未分类';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const departmentChartData = Object.entries(departmentStats).map(([name, value]) => ({
    name,
    value
  }));
  const statusStats = filteredByDate.reduce((acc, item) => {
    const status = item.status === '在职' ? '在职' : '离职';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusChartData = Object.entries(statusStats).map(([name, value]) => ({
    name,
    value
  }));

  // 准备导出数据
  const exportData = filteredData.map(item => ({
    ID: item._id || '',
    姓名: item.name || '',
    联系电话: item.phone || '',
    所属部门: item.department || '',
    职位: item.position || '',
    入职日期: formatDate(item.joinDate) || '',
    状态: item.status || ''
  }));
  const exportHeaders = ['ID', '姓名', '联系电话', '所属部门', '职位', '入职日期', '状态'];
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
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="总人数" value={filteredByDate.length} color="#3B82F6" />
        <StatCard title="在职人数" value={filteredByDate.filter(p => p.status === '在职').length} color="#10B981" />
        <StatCard title="离职人数" value={filteredByDate.filter(p => p.status !== '在职').length} color="#EF4444" />
        <StatCard title="部门数量" value={Object.keys(departmentStats).length} color="#F59E0B" />
      </div>

      {/* 统计图表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatisticsChart title="部门分布" data={departmentChartData} dataKey="value" nameKey="name" type="pie" color="#3B82F6" />
        <StatisticsChart title="在职状态" data={statusChartData} dataKey="value" nameKey="name" type="bar" color="#10B981" />
      </div>

      {/* 操作栏 */}
      <div className="flex justify-between items-center mb-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} label="入职时间" />
        <ExportUtils data={exportData} filename="人员信息" headers={exportHeaders} />
      </div>

      <DataTable columns={columns} data={filteredData} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw]">
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