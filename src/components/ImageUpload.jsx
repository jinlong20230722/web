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

  // 初始化预览URL
  React.useEffect(() => {
    if (value && value.length > 0) {
      setPreviewUrls(Array.isArray(value) ? value : [value]);
    } else {
      setPreviewUrls([]);
    }
  }, [value]);
  const handleFileSelect = async e => {
    const files = Array.from(e.target.files);
    if (multiple && files.length > maxCount) {
      alert(`最多只能上传 ${maxCount} 张图片`);
      return;
    }
    setUploading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const uploadedUrls = [];
      const newPreviewUrls = [];
      for (const file of files) {
        // 上传文件到云存储
        const result = await tcb.uploadFile({
          cloudPath: `personnel/${Date.now()}_${file.name}`,
          fileContent: file
        });

        // 获取文件下载URL
        const fileUrl = await tcb.getTempFileURL({
          fileList: [result.fileID]
        });
        uploadedUrls.push(result.fileID);
        newPreviewUrls.push(fileUrl.fileList[0].tempFileURL);
      }
      setPreviewUrls(newPreviewUrls);

      // 触发 onChange 回调，返回文件ID字符串或字符串数组
      if (onChange) {
        onChange(multiple ? uploadedUrls : uploadedUrls[0]);
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      alert('文件上传失败，请重试');
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
                {multiple ? `最多 ${maxCount} 张` : '单张图片'}
              </p>
            </>}
        </label>
      </div>

      {/* 预览区域 */}
      {previewUrls.length > 0 && <div className="grid grid-cols-3 gap-2 mt-2">
          {previewUrls.map((url, index) => <div key={index} className="relative group">
              <img src={url} alt={`预览 ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => handleRemove(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                <X size={14} />
              </button>
            </div>)}
        </div>}
    </div>;
}