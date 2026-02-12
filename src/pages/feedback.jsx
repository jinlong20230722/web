// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Eye, MessageSquare, Calendar, Phone, MessageCircle } from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { TableSkeleton } from '@/components/TableSkeleton';
export default function Feedback(props) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [personnelData, setPersonnelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  const {
    currentUser
  } = props.$w.auth;
  const handleLogout = async () => {
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      await tcb.auth().signOut();
      await tcb.auth().signInAnonymously();
      await props.$w.auth.getUserInfo({
        force: true
      });
      toast({
        title: '退出成功',
        description: '您已成功退出登录'
      });
    } catch (error) {
      toast({
        title: '退出失败',
        description: error.message || '退出登录时发生错误',
        variant: 'destructive'
      });
    }
  };

  // 人员数据缓存
  const [personnelCache, setPersonnelCache] = useState({
    data: null,
    timestamp: null
  });
  const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
  const loadFeedbackList = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (selectedType !== 'all') {
        filter.feedback_type = {
          $eq: selectedType
        };
      }

      // 加载反馈数据
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'feedback',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: filter
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: pagination.pageSize,
          pageNumber: pagination.page,
          orderBy: [{
            submit_time: 'desc'
          }]
        }
      });

      // 加载人员数据（带缓存）
      let personnelRecords = [];
      const now = Date.now();

      // 检查缓存是否有效
      if (personnelCache.data && personnelCache.timestamp && now - personnelCache.timestamp < CACHE_DURATION) {
        personnelRecords = personnelCache.data;
      } else {
        // 缓存过期或不存在，重新加载
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
        personnelRecords = personnelResult.records || [];

        // 更新缓存
        setPersonnelCache({
          data: personnelRecords,
          timestamp: now
        });
      }
      setPersonnelData(personnelRecords);

      // 关联数据：将 personnel 表的姓名、部门关联到 feedback 数据
      const feedbackRecords = result.records || [];
      const mergedData = feedbackRecords.map(record => {
        // 尝试通过 _id 匹配
        let personnel = personnelRecords.find(p => p._id === record.personnel_id);

        // 如果没找到，尝试通过字符串转换匹配
        if (!personnel) {
          personnel = personnelRecords.find(p => String(p._id) === String(record.personnel_id));
        }
        return {
          ...record,
          name: personnel?.name || '未知',
          department: personnel?.department || '未知'
        };
      });

      // 内容或手机号筛选
      let filteredData = mergedData;
      if (searchKeyword) {
        filteredData = mergedData.filter(record => record.content && record.content.includes(searchKeyword) || record.phone && record.phone.includes(searchKeyword) || record.name && record.name.includes(searchKeyword));
      }
      setFeedbackList(filteredData);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0
      }));
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载反馈记录失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadFeedbackList();
  }, [pagination.page, searchKeyword, selectedType]);
  const handleView = record => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };
  const formatTime = timestamp => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };
  const getTypeBadge = type => {
    const config = {
      '建议': {
        bg: 'bg-blue-100',
        text: 'text-blue-800'
      },
      '投诉': {
        bg: 'bg-red-100',
        text: 'text-red-800'
      },
      '咨询': {
        bg: 'bg-green-100',
        text: 'text-green-800'
      },
      '其他': {
        bg: 'bg-gray-100',
        text: 'text-gray-800'
      }
    };
    const style = config[type] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {type}
      </span>;
  };
  return <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage="feedback" $w={props.$w} />
      <div className="flex-1 flex flex-col">
        <TopNav currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">反馈管理</h2>
            <p className="text-gray-500 mt-1">查看和管理意见反馈</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="搜索内容或手机号..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="反馈类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="建议">建议</SelectItem>
                  <SelectItem value="投诉">投诉</SelectItem>
                  <SelectItem value="咨询">咨询</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold whitespace-nowrap min-w-[100px]">反馈类型</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap min-w-[100px]">姓名</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap min-w-[120px]">部门</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap min-w-[300px]">反馈内容</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap min-w-[130px]">联系电话</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap min-w-[180px]">提交时间</TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap min-w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? <TableSkeleton columns={7} rows={5} /> : feedbackList.length === 0 ? <TableRow>
                      <TableCell colSpan={7}>
                        <EmptyState title="暂无反馈数据" description="当前没有意见反馈记录" icon={MessageCircle} />
                      </TableCell>
                    </TableRow> : feedbackList.map(record => <TableRow key={record._id} className="hover:bg-gray-50">
                        <TableCell className="whitespace-nowrap">{getTypeBadge(record.feedback_type)}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{record.name}</TableCell>
                        <TableCell className="whitespace-nowrap">{record.department}</TableCell>
                        <TableCell>
                          <span className="max-w-[300px] truncate block" title={record.content}>{record.content}</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-400" />
                            {record.phone}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            {formatTime(record.submit_time)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => handleView(record)} title="查看详情">
                            <Eye size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>)}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-500">
                共 {pagination.total} 条记录
              </div>
              <Pagination currentPage={pagination.page} totalPages={Math.ceil(pagination.total / pagination.pageSize)} totalRecords={pagination.total} pageSize={pagination.pageSize} onPageChange={page => setPagination(prev => ({
              ...prev,
              page
            }))} />
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>反馈详情</DialogTitle>
            <DialogDescription>查看意见反馈详细信息</DialogDescription>
          </DialogHeader>
          {selectedRecord && <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">反馈类型</label>
                  {getTypeBadge(selectedRecord.feedback_type)}
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">姓名</label>
                  <p className="font-medium">{selectedRecord.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">部门</label>
                  <p className="font-medium">{selectedRecord.department}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">联系电话</label>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <p className="font-medium">{selectedRecord.phone}</p>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm text-gray-500">反馈内容</label>
                  <p className="font-medium">{selectedRecord.content}</p>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm text-gray-500">提交时间</label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <p className="font-medium">{formatTime(selectedRecord.submit_time)}</p>
                  </div>
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}