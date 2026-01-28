// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Download } from 'lucide-react';

import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { StatisticsChart } from '@/components/StatisticsChart';
import { StatCard } from '@/components/StatCard';
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
  const columns = [{
    key: '_id',
    label: 'ID'
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
  const filteredData = attendance.filter(item => {
    const matchesSearch = item.personnelName?.toLowerCase().includes(searchTerm.toLowerCase()) || item.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === 'normal' && item.status === '正常' || filterStatus === 'abnormal' && item.status !== '正常';
    return matchesSearch && matchesFilter;
  });

  // 统计数据
  const statusStats = attendance.reduce((acc, item) => {
    const status = item.status === '正常' ? '正常' : '异常';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusChartData = Object.entries(statusStats).map(([name, value]) => ({
    name,
    value
  }));

  // 按日期统计
  const dateStats = attendance.reduce((acc, item) => {
    if (item.checkInTime) {
      const date = new Date(item.checkInTime).toLocaleDateString('zh-CN');
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});
  const dateChartData = Object.entries(dateStats).slice(-7).map(([name, value]) => ({
    name,
    value
  }));

  // 导出 CSV
  const handleExportCSV = () => {
    const headers = ['ID', '姓名', '人员ID', '打卡地址', '签到时间', '状态'];
    const csvContent = [headers.join(','), ...filteredData.map(item => [item._id || '', item.personnelName || '', item.personnelId || '', item.address || '', formatDateTime(item.checkInTime) || '', item.status || ''].join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `打卡记录_${new Date().toLocaleDateString('zh-CN')}.csv`;
    link.click();
    toast({
      title: '导出成功',
      description: '打卡记录已导出为 CSV 文件'
    });
  };
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
  return <PageLayout currentPage="attendance" onPageChange={pageId => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {}
    });
  }} title="打卡签到管理" subtitle="查看和管理打卡记录" user={props.$w?.auth?.currentUser}>
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="总打卡次数" value={attendance.length} color="#3B82F6" />
        <StatCard title="正常打卡" value={attendance.filter(a => a.status === '正常').length} color="#10B981" />
        <StatCard title="异常打卡" value={attendance.filter(a => a.status !== '正常').length} color="#EF4444" />
        <StatCard title="今日打卡" value={attendance.filter(a => {
        const today = new Date().toLocaleDateString('zh-CN');
        return a.checkInTime && new Date(a.checkInTime).toLocaleDateString('zh-CN') === today;
      }).length} color="#F59E0B" />
      </div>

      {/* 统计图表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatisticsChart title="打卡状态" data={statusChartData} dataKey="value" nameKey="name" type="pie" color="#3B82F6" />
        <StatisticsChart title="近7天打卡趋势" data={dateChartData} dataKey="value" nameKey="name" type="bar" color="#10B981" />
      </div>

      {/* 操作栏 */}
      <div className="flex justify-end mb-4">
        <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2" size={16} />
          导出 CSV
        </Button>
      </div>

      <DataTable columns={columns} data={filteredData} onAdd={handleAdd} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw]">
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