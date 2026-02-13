// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Eye, MapPin, Calendar, User, Filter, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { Badge } from '@/components/Badge';
export default function EventReportManagement(props) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    eventType: '',
    startTime: '',
    endTime: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [sortField, setSortField] = useState('event_time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const {
    toast
  } = useToast();
  const {
    currentUser
  } = props.$w.auth;

  // 事件类型选项
  const eventTypeOptions = ['培训演习', '治安事件', '好人好事', '安全隐患', '其他'];

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const where = {};

      // 构建查询条件
      if (filters.eventType) {
        where.event_type = {
          $eq: filters.eventType
        };
      }

      // 时间范围筛选
      if (filters.startTime) {
        where.event_time = {
          $gte: new Date(filters.startTime).getTime()
        };
      }
      if (filters.endTime) {
        if (!where.event_time) {
          where.event_time = {};
        }
        where.event_time.$lte = new Date(filters.endTime).getTime();
      }

      // 模糊搜索（姓名）
      if (searchTerm) {
        where.name = {
          $regex: searchTerm
        };
      }
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'event_report',
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
  }, [pagination.page, filters, searchTerm, sortField, sortOrder]);

  // 查看详情
  const handleViewDetail = record => {
    setSelectedRecord(record);
    setCurrentImageIndex(0);
    setIsDetailOpen(true);
  };

  // 格式化时间
  const formatTime = timestamp => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 获取事件类型徽章样式
  const getEventTypeBadge = type => {
    const config = {
      '培训演习': {
        bg: 'bg-slate-100',
        text: 'text-blue-800'
      },
      '治安事件': {
        bg: 'bg-red-100',
        text: 'text-red-800'
      },
      '好人好事': {
        bg: 'bg-emerald-100',
        text: 'text-green-800'
      },
      '安全隐患': {
        bg: 'bg-orange-100',
        text: 'text-orange-800'
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
    return <Badge className={`${style.bg} ${style.text}`}>{type}</Badge>;
  };

  // 图片切换
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? selectedRecord.image_files.length - 1 : prev - 1);
  };
  const handleNextImage = () => {
    setCurrentImageIndex(prev => prev === selectedRecord.image_files.length - 1 ? 0 : prev + 1);
  };

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({
      eventType: '',
      startTime: '',
      endTime: ''
    });
    setSearchTerm('');
  };
  return <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage="eventReportManagement" $w={props.$w} />
      <div className="flex-1 flex flex-col">
        <TopNav currentUser={currentUser} />
        <main className="flex-1 p-6 overflow-auto">
          {/* 页面标题 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">事件上报管理</h2>
            <p className="text-gray-500 mt-1">查看和管理事件上报记录</p>
          </div>

          {/* 筛选区域 */}
          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-gray-600" />
              <span className="font-medium text-gray-700">筛选条件</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 事件类型筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">事件类型</label>
                <Select value={filters.eventType || 'all'} onValueChange={value => setFilters(prev => ({
                ...prev,
                eventType: value === 'all' ? '' : value
              }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="全部类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    {eventTypeOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* 开始时间筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
                <Input type="datetime-local" value={filters.startTime} onChange={e => setFilters(prev => ({
                ...prev,
                startTime: e.target.value
              }))} />
              </div>

              {/* 结束时间筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">结束时间</label>
                <Input type="datetime-local" value={filters.endTime} onChange={e => setFilters(prev => ({
                ...prev,
                endTime: e.target.value
              }))} />
              </div>

              {/* 人员姓名搜索 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">人员姓名</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input placeholder="搜索姓名..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            {/* 重置按钮 */}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={handleResetFilters}>
                重置筛选
              </Button>
            </div>
          </div>

          {/* 数据表格 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-slate-700 to-slate-800">
                <TableRow>
                  <TableHead className="font-semibold text-white cursor-pointer hover:bg-slate-700" onClick={() => {
                  if (sortField === 'name') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('name');
                    setSortOrder('asc');
                  }
                }}>
                    上报人姓名 {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="font-semibold text-white cursor-pointer hover:bg-slate-700" onClick={() => {
                  if (sortField === 'event_type') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('event_type');
                    setSortOrder('asc');
                  }
                }}>
                    事件类型 {sortField === 'event_type' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="font-semibold text-white cursor-pointer hover:bg-slate-700" onClick={() => {
                  if (sortField === 'event_time') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('event_time');
                    setSortOrder('asc');
                  }
                }}>
                    上报时间 {sortField === 'event_time' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="font-semibold text-white cursor-pointer hover:bg-slate-700" onClick={() => {
                  if (sortField === 'address') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('address');
                    setSortOrder('asc');
                  }
                }}>
                    事件地址 {sortField === 'address' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="font-semibold text-white text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      加载中...
                    </TableCell>
                  </TableRow> : data.length === 0 ? <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow> : data.map(record => <TableRow key={record._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          {record.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getEventTypeBadge(record.event_type)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {formatTime(record.event_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="max-w-[250px] truncate">{record.address}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(record)} className="text-blue-600 hover:text-blue-700">
                          <Eye size={16} className="mr-1" />
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>)}
              </TableBody>
            </Table>

            {/* 分页 */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                共 {pagination.total} 条记录，第 {pagination.page} 页
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({
                ...prev,
                page: prev.page - 1
              }))} disabled={pagination.page === 1}>
                  <ChevronLeft size={16} className="mr-1" />
                  上一页
                </Button>
                <span className="px-3 py-1 text-sm font-medium bg-white border rounded">
                  {pagination.page}
                </span>
                <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({
                ...prev,
                page: prev.page + 1
              }))} disabled={pagination.page * pagination.pageSize >= pagination.total}>
                  下一页
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 详情弹窗 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">事件详情</DialogTitle>
            <DialogDescription>查看事件上报详细信息（只读模式）</DialogDescription>
          </DialogHeader>
          {selectedRecord && <div className="space-y-6 py-4">
              {/* 基本信息 */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  基本信息
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">上报人姓名</label>
                    <p className="font-medium text-gray-900 mt-1">{selectedRecord.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">事件类型</label>
                    <div className="mt-1">{getEventTypeBadge(selectedRecord.event_type)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">上报时间</label>
                    <p className="font-medium text-gray-900 mt-1">{formatTime(selectedRecord.event_time)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">创建时间</label>
                    <p className="font-medium text-gray-900 mt-1">{formatTime(selectedRecord.create_time)}</p>
                  </div>
                </div>
              </div>

              {/* 事件信息 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-green-600" />
                  事件信息
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">事件地址</label>
                    <p className="font-medium text-gray-900 mt-1">{selectedRecord.address}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">事件说明</label>
                    <p className="font-medium text-gray-900 mt-1 bg-white p-3 rounded border">{selectedRecord.description}</p>
                  </div>
                </div>
              </div>

              {/* 事件照片 */}
              {selectedRecord.image_files && selectedRecord.image_files.length > 0 && <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Eye size={18} className="text-purple-600" />
                    事件照片 ({selectedRecord.image_files.length}张)
                  </h3>
                  <div className="relative">
                    <div className="flex items-center justify-center gap-4">
                      <Button variant="outline" size="sm" onClick={handlePrevImage} disabled={selectedRecord.image_files.length <= 1}>
                        <ChevronLeft size={16} />
                      </Button>
                      <div className="relative">
                        <img src={selectedRecord.image_files[currentImageIndex].url || selectedRecord.image_files[currentImageIndex]} alt={`事件照片${currentImageIndex + 1}`} className="max-w-full h-64 object-contain rounded-lg cursor-pointer border-2 border-white shadow-lg" onClick={() => setIsImageZoomed(true)} />
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {selectedRecord.image_files.length}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleNextImage} disabled={selectedRecord.image_files.length <= 1}>
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                </div>}

              {/* 事件视频 */}
              {selectedRecord.video_file && <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Play size={18} className="text-orange-600" />
                    事件视频
                  </h3>
                  <div className="relative">
                    <video src={selectedRecord.video_file.url || selectedRecord.video_file} controls className="w-full rounded-lg border-2 border-white shadow-lg" style={{
                maxHeight: '400px'
              }}>
                      您的浏览器不支持视频播放
                    </video>
                  </div>
                </div>}
            </div>}
        </DialogContent>
      </Dialog>

      {/* 图片放大弹窗 */}
      <Dialog open={isImageZoomed} onOpenChange={setIsImageZoomed}>
        <DialogContent className="max-w-6xl bg-transparent border-none shadow-none p-0">
          <div className="relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-black hover:bg-opacity-70 text-white" onClick={() => setIsImageZoomed(false)}>
              <X size={24} />
            </Button>
            <img src={selectedRecord?.image_files?.[currentImageIndex]?.url || selectedRecord?.image_files?.[currentImageIndex]} alt="放大图片" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}