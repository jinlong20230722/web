// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { X, Image as ImageIcon, Video, MapPin, Clock, User, Phone, Calendar } from 'lucide-react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Badge } from '@/components/ui';

export function AttendanceDetailModal({
  open,
  onClose,
  record
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  if (!record) return null;
  const handleImageClick = imageUrl => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };
  return <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              打卡签到详情
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* 基本信息 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                基本信息
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm text-slate-500">姓名</p>
                    <p className="font-medium text-slate-800">{record.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm text-slate-500">电话</p>
                    <p className="font-medium text-slate-800">{record.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm text-slate-500">打卡时间</p>
                    <p className="font-medium text-slate-800">
                      {new Date(record.check_in_time).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm text-slate-500">创建时间</p>
                    <p className="font-medium text-slate-800">
                      {new Date(record.create_time).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 打卡状态 */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                打卡信息
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">打卡地址</p>
                    <p className="font-medium text-slate-800">{record.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4" />
                  <div>
                    <p className="text-sm text-slate-500">打卡状态</p>
                    <Badge className={`mt-1 ${record.status === '正常' ? 'bg-emerald-600 hover:bg-emerald-700' : record.status === '迟到' ? 'bg-amber-600 hover:bg-amber-700' : record.status === '早退' ? 'bg-orange-600 hover:bg-orange-700' : record.status === '缺卡' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-600 hover:bg-slate-700'}`}>
                      {record.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* 打卡照片 */}
            {record.image_files && record.image_files.length > 0 && <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  打卡照片 ({record.image_files.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {record.image_files.map((imageUrl, index) => <div key={index} className="relative group cursor-pointer" onClick={() => handleImageClick(imageUrl)}>
                      <img src={imageUrl} alt={`打卡照片 ${index + 1}`} className="w-full h-40 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>)}
                </div>
              </div>}

            {/* 打卡视频 */}
            {record.video_file && <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-orange-600" />
                  打卡视频
                </h3>
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video src={record.video_file} controls className="w-full">
                    您的浏览器不支持视频播放
                  </video>
                </div>
              </div>}
          </div>

          {/* 关闭按钮 */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button onClick={onClose}>关闭</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 图片放大弹窗 */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>查看照片</DialogTitle>
          </DialogHeader>
          {selectedImage && <img src={selectedImage} alt="放大照片" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>;
}