// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

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
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          + 添加打卡
        </Button>
      </div>

      <DataTable columns={columns} data={filteredData} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />

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