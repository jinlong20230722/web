// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { X, Edit, Download, ChevronLeft, ChevronRight } from 'lucide-react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';

export default function PersonnelDetailModal({
  record,
  onClose,
  onEdit,
  $w
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [visibleImages, setVisibleImages] = useState({});
  const [isOpen, setIsOpen] = useState(true);
  if (!record) return null;

  // 处理关闭
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // 获取图片临时 URL
  const getImageUrl = async fileId => {
    if (!fileId) return null;

    // 如果已经是完整的 URL，直接返回
    if (typeof fileId === 'string' && (fileId.startsWith('http://') || fileId.startsWith('https://'))) {
      return fileId;
    }

    // 如果是文件 ID，通过云存储 API 获取临时 URL
    try {
      const tcb = await $w.cloud.getCloudInstance();
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

  // 加载所有图片（懒加载）
  useEffect(() => {
    const loadImages = async () => {
      setLoadingImages(true);
      try {
        const images = [];

        // 身份证正面
        if (record.id_card_front_image) {
          images.push({
            type: '身份证正面',
            fileId: record.id_card_front_image,
            url: null
          });
        }

        // 身份证反面
        if (record.id_card_back_image) {
          images.push({
            type: '身份证反面',
            fileId: record.id_card_back_image,
            url: null
          });
        }

        // 证件图片
        if (record.certificate_images && Array.isArray(record.certificate_images)) {
          for (let i = 0; i < record.certificate_images.length; i++) {
            images.push({
              type: `证件${i + 1}`,
              fileId: record.certificate_images[i],
              url: null
            });
          }
        }
        setAllImages(images);

        // 初始只加载前4张图片
        const initialVisible = {};
        const loadCount = Math.min(4, images.length);
        for (let i = 0; i < loadCount; i++) {
          const url = await getImageUrl(images[i].fileId);
          if (url) {
            initialVisible[i] = url;
          }
        }
        setVisibleImages(initialVisible);
      } catch (error) {
        console.error('加载图片失败:', error);
      } finally {
        setLoadingImages(false);
      }
    };
    loadImages();
  }, [record]);

  // 懒加载图片
  const loadImage = async index => {
    if (visibleImages[index] || !allImages[index]) return;
    try {
      const url = await getImageUrl(allImages[index].fileId);
      if (url) {
        setVisibleImages(prev => ({
          ...prev,
          [index]: url
        }));
      }
    } catch (error) {
      console.error('加载图片失败:', error);
    }
  };

  // 处理图片进入视口
  const handleImageInView = index => {
    loadImage(index);
  };

  // 格式化时间
  const formatTime = timestamp => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取状态样式
  const getStatusStyle = status => {
    switch (status) {
      case '在职':
        return 'bg-green-100 text-green-800';
      case '离职':
        return 'bg-red-100 text-red-800';
      case '试用期':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 查看大图
  const handleViewImage = image => {
    setSelectedImage(image);
    setShowImageModal(true);
  };
  return <>
      <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">人员详情</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* 基本信息 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">基本信息</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">姓名</label>
                  <p className="text-sm text-gray-900 font-medium">{record.name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">性别</label>
                  <p className="text-sm text-gray-900">{record.gender || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">年龄</label>
                  <p className="text-sm text-gray-900">{record.age || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">手机号</label>
                  <p className="text-sm text-gray-900">{record.phone || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">身份证号码</label>
                  <p className="text-sm text-gray-900">{record.id_number || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">在职状态</label>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(record.employment_status)}`}>
                    {record.employment_status || '-'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">所属部门</label>
                  <p className="text-sm text-gray-900">{record.department || '-'}</p>
 </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">职务</label>
                  <p className="text-sm text-gray-900">{record.position || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">入职登记时间</label>
                  <p className="text-sm text-gray-900">{formatTime(record.register_time)}</p>
                </div>
              </div>
            </div>

            {/* 身份证地址 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">身份证地址</h3>
              <p className="text-sm text-gray-900">{record.id_address || '-'}</p>
            </div>

            {/* 紧急联系人 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">紧急联系人</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">姓名</label>
                  <p className="text-sm text-gray-900">{record.emergency_contact_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">电话</label>
                  <p className="text-sm text-gray-900">{record.emergency_contact_phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* 证件图片 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">证件图片</h3>
              {loadingImages ? <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">加载图片中...</div>
                </div> : allImages.length === 0 ? <p className="text-sm text-gray-500">暂无证件图片</p> : <div className="grid grid-cols-2 gap-4">
                  {allImages.map((image, index) => {
                const imageUrl = visibleImages[index];
                return <div key={index} className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  if (imageUrl) {
                    handleViewImage({
                      type: image.type,
                      url: imageUrl
                    });
                  }
                }} onMouseEnter={() => handleImageInView(index)}>
                      <div className="aspect-[1.6] bg-gray-100 flex items-center justify-center">
                        {imageUrl ? <img src={imageUrl} alt={image.type} className="w-full h-full object-cover" onError={e => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                    }} /> : <div className="text-gray-400 text-sm">点击加载</div>}
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-sm font-medium text-gray-900">{image.type}</p>
                      </div>
                    </div>;
              })}
                </div>}
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                关闭
              </Button>
              <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 图片查看弹窗 */}
      {showImageModal && selectedImage && <Dialog open={showImageModal} onOpenChange={open => !open && setShowImageModal(false)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold">{selectedImage.type}</DialogTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowImageModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
              <img src={selectedImage.url} alt={selectedImage.type} className="max-w-full max-h-[70vh] object-contain" onError={e => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E';
          }} />
            </div>
          </DialogContent>
        </Dialog>}
    </>;
}