// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Upload, X, Image as ImageIcon } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';

export default function ImageUpload({
  label,
  value,
  onChange,
  multiple = false,
  maxCount = 1,
  required = false,
  accept = 'image/*',
  $w
}) {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingPreviews, setLoadingPreviews] = useState(false);

  // 初始化预览URL
  React.useEffect(() => {
    const loadPreviews = async () => {
      console.log('ImageUpload - 开始加载预览, value:', value, 'type:', typeof value);

      // 检查value是否为空
      if (!value) {
        console.log('ImageUpload - value为空，清空预览');
        setPreviewUrls([]);
        return;
      }

      // 检查value是否为空字符串
      if (typeof value === 'string' && value.length === 0) {
        console.log('ImageUpload - value为空字符串，清空预览');
        setPreviewUrls([]);
        return;
      }

      // 检查value是否为空数组
      if (Array.isArray(value) && value.length === 0) {
        console.log('ImageUpload - value为空数组，清空预览');
        setPreviewUrls([]);
        return;
      }
      setLoadingPreviews(true);
      try {
        console.log('ImageUpload - 获取云开发实例...');
        const tcb = await $w.cloud.getCloudInstance();
        if (!tcb) {
          throw new Error('云开发实例获取失败');
        }
        const fileIds = Array.isArray(value) ? value : [value];
        console.log('ImageUpload - fileIds:', fileIds);

        // 获取临时URL
        console.log('ImageUpload - 调用getTempFileURL...');
        const urlResult = await tcb.getTempFileURL({
          fileList: fileIds
        });
        console.log('ImageUpload - getTempFileURL结果:', urlResult);
        const urls = urlResult.fileList.map(item => item.tempFileURL);
        console.log('ImageUpload - 预览URL:', urls);
        setPreviewUrls(urls);
      } catch (error) {
        console.error('ImageUpload - 加载预览失败:', error);
        console.error('ImageUpload - 错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });

        // 如果获取临时URL失败，尝试直接使用value（可能是URL）
        console.log('ImageUpload - 尝试直接使用value作为URL');
        if (Array.isArray(value)) {
          setPreviewUrls(value);
        } else {
          setPreviewUrls([value]);
        }
      } finally {
        setLoadingPreviews(false);
      }
    };

    // 添加防抖，避免频繁调用
    const timeoutId = setTimeout(loadPreviews, 100);
    return () => clearTimeout(timeoutId);
  }, [value, $w]);
  const handleFileSelect = async e => {
    const files = Array.from(e.target.files);

    // 验证文件数量
    if (multiple && files.length > maxCount) {
      alert(`最多只能上传 ${maxCount} 张图片`);
      return;
    }

    // 验证文件大小（最大5MB）
    const maxSize = 5 * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxSize) {
        alert(`文件 ${file.name} 超过5MB限制`);
        return;
      }
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        alert(`文件 ${file.name} 格式不支持，请上传图片文件`);
        return;
      }
    }
    if (!$w) {
      alert('系统错误：缺少云开发实例');
      return;
    }
    setUploading(true);
    try {
      console.log('开始获取云开发实例...');
      const tcb = await $w.cloud.getCloudInstance();
      if (!tcb) {
        throw new Error('云开发实例获取失败');
      }
      console.log('云开发实例获取成功，开始上传文件...');
      const uploadedUrls = [];
      const newPreviewUrls = [];
      for (const file of files) {
        console.log('正在上传文件:', file.name, '大小:', file.size, '类型:', file.type);
        try {
          // 上传文件到云存储
          const result = await tcb.uploadFile({
            cloudPath: `personnel/${Date.now()}_${file.name}`,
            fileContent: file
          });
          console.log('文件上传成功，fileID:', result.fileID);

          // 获取文件下载URL
          const fileUrl = await tcb.getTempFileURL({
            fileList: [result.fileID]
          });
          console.log('临时URL获取成功:', fileUrl.fileList[0].tempFileURL);
          uploadedUrls.push(result.fileID);
          newPreviewUrls.push(fileUrl.fileList[0].tempFileURL);
        } catch (uploadError) {
          console.error(`文件 ${file.name} 上传失败:`, uploadError);
          throw new Error(`文件 ${file.name} 上传失败: ${uploadError.message || '未知错误'}`);
        }
      }
      setPreviewUrls(newPreviewUrls);
      console.log('所有文件上传完成，文件ID:', uploadedUrls);

      // 触发 onChange 回调，返回文件ID字符串或字符串数组
      if (onChange) {
        onChange(multiple ? uploadedUrls : uploadedUrls[0]);
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      alert(`文件上传失败：${error.message || '未知错误'}`);
    } finally {
      setUploading(false);
    }
  };
  const handleRemove = index => {
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviewUrls);

    // 更新数据
    if (onChange) {
      if (multiple) {
        const newValue = Array.isArray(value) ? value.filter((_, i) => i !== index) : [];
        onChange(newValue);
      } else {
        onChange('');
      }
    }
  };
  return <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${uploading ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-blue-500'}`}>
        <input type="file" accept={accept} multiple={multiple} onChange={handleFileSelect} className="hidden" id={`upload-${label}`} disabled={uploading} />
        
        <label htmlFor={`upload-${label}`} className={`flex flex-col items-center justify-center cursor-pointer min-h-[120px] ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-sm text-gray-600">上传中...</p>
            </> : <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">点击上传图片</p>
              <p className="text-xs text-gray-400 mt-1">
                {multiple ? `最多 ${maxCount} 张` : '单张图片'} · 支持JPG/PNG/GIF · 最大5MB
              </p>
            </>}
        </label>
      </div>

      {/* 预览区域 */}
      {loadingPreviews && <div className="grid grid-cols-3 gap-2 mt-2">
          {[1, 2, 3].map(i => <div key={i} className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
            </div>)}
        </div>}
      
      {previewUrls.length > 0 && !loadingPreviews && <div className="grid grid-cols-3 gap-2 mt-2">
          {previewUrls.map((url, index) => <div key={index} className="relative group">
              <img src={url} alt={`预览 ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" onLoad={() => console.log(`ImageUpload - 图片 ${index + 1} 加载成功:`, url)} onError={e => {
          console.error(`ImageUpload - 图片 ${index + 1} 加载失败:`, url);
          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3E加载失败%3C/text%3E%3C/svg%3E';
        }} />
              <button type="button" onClick={() => handleRemove(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                <X size={14} />
              </button>
            </div>)}
        </div>}
      
      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <div>Value: {JSON.stringify(value)}</div>
          <div>Preview URLs: {previewUrls.length} 个</div>
          <div>Loading: {uploading ? '是' : '否'}</div>
          <div>Loading Previews: {loadingPreviews ? '是' : '否'}</div>
        </div>}
    </div>;
}