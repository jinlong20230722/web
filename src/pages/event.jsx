// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Eye, AlertTriangle, MapPin, Calendar, User } from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { Pagination } from '@/components/Pagination';
import { hasPermission, getDataFilter } from '@/lib/permissions';
export default function Event(props) {
  const [eventList, setEventList] = useState([]);
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
  const [imageUrls, setImageUrls] = useState({});
  const [loadingImages, setLoadingImages] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const {
    toast
  } = useToast();
  const {
    currentUser
  } = props.$w.auth;
  const canViewEvent = hasPermission(currentUser, 'view:event');
  const canViewEventDetail = hasPermission(currentUser, 'view:event_detail');

  // 获取图片临时 URL
  const getImageUrl = async fileId => {
    if (!fileId) return null;

    // 如果已经是完整的 URL，直接返回
    if (typeof fileId === 'string' && (fileId.startsWith('http://') || fileId.startsWith('https://'))) {
      return fileId;
    }

    // 如果是文件 ID，通过云存储 API 获取临时 URL
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const result = await tcb.getTempFileURL({
        fileList: [fileId]
      });
      if (result.fileList && result.fileList.length > 0) {
        return result.fileList[0].tempFileURL;
      }
      return null;
    } catch (error) {
      console.error('获取图片 URL 失败:', error);
      return null;
    }
  };

  // 获取视频临时 URL
  const getVideoUrl = async fileId => {
    if (!fileId) return null;

    // 如果已经是完整的 URL，直接返回
    if (typeof fileId === 'string' && (fileId.startsWith('http://') || fileId.startsWith('https://'))) {
      return fileId;
    }

    // 如果是文件 ID，通过云存储 API 获取临时 URL
    try {
      const tcb = await props.$w.cloud.getCloudInstance();
      const result = await tcb.getTempFileURL({
        fileList: [fileId]
      });
      if (result.fileList && result.fileList.length > 0) {
        return result.fileList[0].tempFileURL;
      }
      return null;
    } catch (error) {
      console.error('获取视频 URL 失败:', error);
      return null;
    }
  };

  // 加载图片 URL
  useEffect(() => {
    const loadImages = async () => {
      if (!selectedRecord || !selectedRecord.image_files || selectedRecord.image_files.length === 0) {
        setImageUrls({});
        return;
      }
      setLoadingImages(true);
      try {
        const urls = {};
        for (let i = 0; i < selectedRecord.image_files.length; i++) {
          const fileId = selectedRecord.image_files[i];
          const url = await getImageUrl(fileId);
          urls[i] = url;
        }
        setImageUrls(urls);
      } catch (error) {
        console.error('加载图片失败:', error);
      } finally {
        setLoadingImages(false);
      }
    };
    loadImages();
  }, [selectedRecord]);

  // 加载视频 URL
  useEffect(() => {
    const loadVideo = async () => {
      if (!selectedRecord || !selectedRecord.video_file) {
        setVideoUrl(null);
        return;
      }
      setLoadingVideo(true);
      try {
        const url = await getVideoUrl(selectedRecord.video_file);
        setVideoUrl(url);
      } catch (error) {
        console.error('加载视频失败:', error);
      } finally {
        setLoadingVideo(false);
      }
    };
    loadVideo();
  }, [selectedRecord]);
  const loadEventList = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (searchKeyword) {
        filter.$or = [{
          name: {
            $search: searchKeyword
          }
        }, {
          address: {
            $search: searchKeyword
          }
        }];
      }
      if (selectedType !== 'all') {
        filter.event_type = {
          $eq: selectedType
        };
      }
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'event_report',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: filter
          },
          select: {
            $master: true,
            name: true
          },
          getCount: true,
          pageSize: pagination.pageSize,
          pageNumber: pagination.page,
          orderBy: [{
            event_time: 'desc'
          }]
        }
      });
      setEventList(result.records || []);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0
      }));
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载事件记录失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadEventList();
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
      '培训演习': {
        bg: 'bg-blue-100',
        text: 'text-blue-800'
      },
      '治安事件': {
        bg: 'bg-red-100',
        text: 'text-red-800'
      },
      '好人好事': {
        bg: 'bg-green-100',
        text: 'text-green-800'
      },
      '设施故障': {
        bg: 'bg-orange-100',
        text: 'text-orange-800'
      },
      '临时勤务': {
        bg: 'bg-purple-100',
        text: 'text-purple-800'
      },
      '警保联动': {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800'
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
      <Sidebar currentPage="event" $w={props.$w} />
      <div className="flex-1 flex flex-col">
        <TopNav currentUser={currentUser} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">事件管理</h2>
            <p className="text-gray-500 mt-1">查看和处理事件上报</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="搜索姓名或地址..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="事件类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="培训演习">培训演习</SelectItem>
                  <SelectItem value="治安事件">治安事件</SelectItem>
                  <SelectItem value="好人好事">好人好事</SelectItem>
                  <SelectItem value="设施故障">设施故障</SelectItem>
                  <SelectItem value="临时勤务">临时勤务</SelectItem>
                  <SelectItem value="警保联动">警保联动</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">上报人</TableHead>
                  <TableHead className="font-semibold">事件类型</TableHead>
                  <TableHead className="font-semibold">事件时间</TableHead>
                  <TableHead className="font-semibold">事件地址</TableHead>
                  <TableHead className="font-semibold">事件说明</TableHead>
                  <TableHead className="font-semibold text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      加载中...
                    </TableCell>
                  </TableRow> : eventList.length === 0 ? <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow> : eventList.map(record => <TableRow key={record._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>{getTypeBadge(record.event_type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {formatTime(record.event_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="max-w-[200px] truncate">{record.address}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{record.description}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleView(record)}>
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>)}
              </TableBody>
            </Table>

            <Pagination currentPage={pagination.page} totalPages={Math.ceil(pagination.total / pagination.pageSize)} totalRecords={pagination.total} pageSize={pagination.pageSize} onPageChange={page => setPagination(prev => ({
            ...prev,
            page
          }))} />
          </div>
        </main>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>事件详情</DialogTitle>
            <DialogDescription>查看事件上报详细信息</DialogDescription>
          </DialogHeader>
          {selectedRecord && <div className="flex-1 overflow-y-auto space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">上报人</label>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <p className="font-medium">{selectedRecord.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">事件类型</label>
                  {getTypeBadge(selectedRecord.event_type)}
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">事件时间</label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <p className="font-medium">{formatTime(selectedRecord.event_time)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">事件地址</label>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <p className="font-medium">{selectedRecord.address}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-500">事件说明</label>
                <p className="font-medium">{selectedRecord.description}</p>
              </div>
              {selectedRecord.image_files && selectedRecord.image_files.length > 0 && <div className="space-y-2">
                  <label className="text-sm text-gray-500">事件照片</label>
                  {loadingImages ? <div className="text-sm text-gray-500">加载图片中...</div> : <div className="grid grid-cols-3 gap-2">
                      {selectedRecord.image_files.map((img, idx) => {
                const url = imageUrls[idx];
                return <img key={idx} src={url || ''} alt={`事件照片${idx + 1}`} className="w-full h-24 object-cover rounded" onError={e => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                }} />;
              })}
                    </div>}
                </div>}
              {selectedRecord.video_file && <div className="space-y-2">
                  <label className="text-sm text-gray-500">事件视频</label>
                  {loadingVideo ? <div className="text-sm text-gray-500">加载视频中...</div> : videoUrl ? <div className="w-full">
                      <video src={videoUrl} controls className="w-full h-48 object-cover rounded bg-gray-100">
                        您的浏览器不支持视频播放
                      </video>
                    </div> : <div className="text-sm text-gray-500">视频加载失败</div>}
                </div>}
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}