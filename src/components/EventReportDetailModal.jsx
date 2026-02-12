// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui';
// @ts-ignore;
import { User, MapPin, Calendar, Eye, Play, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { Badge } from '@/components/Badge';
export function EventReportDetailModal({
  record,
  open,
  onOpenChange
}) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);
  if (!record) return null;
  const formatTime = timestamp => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };
  const getEventTypeBadge = type => {
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
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? record.image_files.length - 1 : prev - 1);
  };
  const handleNextImage = () => {
    setCurrentImageIndex(prev => prev === record.image_files.length - 1 ? 0 : prev + 1);
  };
  return <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">事件详情</DialogTitle>
            <DialogDescription>查看事件上报详细信息（只读模式）</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* 基本信息 */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                基本信息
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">上报人姓名</label>
                  <p className="font-medium text-gray-900 mt-1">{record.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">事件类型</label>
                  <div className="mt-1">{getEventTypeBadge(record.event_type)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">上报时间</label>
                  <p className="font-medium text-gray-900 mt-1">{formatTime(record.event_time)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">创建时间</label>
                  <p className="font-medium text-gray-900 mt-1">{formatTime(record.create_time)}</p>
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
                  <p className="font-medium text-gray-900 mt-1">{record.address}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">事件说明</label>
                  <p className="font-medium text-gray-900 mt-1 bg-white p-3 rounded border">{record.description}</p>
                </div>
              </div>
            </div>

            {/* 事件照片 */}
            {record.image_files && record.image_files.length > 0 && <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Eye size={18} className="text-purple-600" />
                  事件照片 ({record.image_files.length}张)
                </h3>
                <div className="relative">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={handlePrevImage} disabled={record.image_files.length <= 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft size={20} />
                    </button>
                    <div className="relative">
                      <img src={record.image_files[currentImageIndex].url || record.image_files[currentImageIndex]} alt={`事件照片${currentImageIndex + 1}`} className="max-w-full h-64 object-contain rounded-lg cursor-pointer border-2 border-white shadow-lg" onClick={() => setIsImageZoomed(true)} />
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {record.image_files.length}
                      </div>
                    </div>
                    <button onClick={handleNextImage} disabled={record.image_files.length <= 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>}

            {/* 事件视频 */}
            {record.video_file && <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Play size={18} className="text-orange-600" />
                  事件视频
                </h3>
                <div className="relative">
                  <video src={record.video_file.url || record.video_file} controls className="w-full rounded-lg border-2 border-white shadow-lg" style={{
                maxHeight: '400px'
              }}>
                    您的浏览器不支持视频播放
                  </video>
                </div>
              </div>}
          </div>
        </DialogContent>
      </Dialog>

      {/* 图片放大弹窗 */}
      <Dialog open={isImageZoomed} onOpenChange={setIsImageZoomed}>
        <DialogContent className="max-w-6xl bg-transparent border-none shadow-none p-0">
          <div className="relative">
            <button onClick={() => setIsImageZoomed(false)} className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-black hover:bg-opacity-70 text-white p-2 rounded-full">
              <X size={24} />
            </button>
            <img src={record.image_files?.[currentImageIndex]?.url || record.image_files?.[currentImageIndex]} alt="放大图片" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
        </DialogContent>
      </Dialog>
    </>;
}