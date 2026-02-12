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
  accept = 'image/*'
}) {
  const [previewUrls, setPreviewUrls] = useState([]);
  const handleFileSelect = async e => {
    const files = Array.from(e.target.files);
    if (multiple && files.length > maxCount) {
      alert(`最多只能上传 ${maxCount} 张图片`);
      return;
    }
    try {
      // 这里需要实现文件上传到云存储的逻辑
      // 暂时使用本地预览
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);

      // 触发 onChange 回调
      if (onChange) {
        onChange(files);
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      alert('文件上传失败，请重试');
    }
  };
  const handleRemove = index => {
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviewUrls);
    if (onChange) {
      onChange(newPreviewUrls);
    }
  };
  return <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
        <input type="file" accept={accept} multiple={multiple} onChange={handleFileSelect} className="hidden" id={`upload-${label}`} />
        
        <label htmlFor={`upload-${label}`} className="flex flex-col items-center justify-center cursor-pointer min-h-[120px]">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">点击上传图片</p>
          <p className="text-xs text-gray-400 mt-1">
            {multiple ? `最多 ${maxCount} 张` : '单张图片'}
          </p>
        </label>
      </div>

      {/* 预览区域 */}
      {previewUrls.length > 0 && <div className="grid grid-cols-3 gap-2 mt-2">
          {previewUrls.map((url, index) => <div key={index} className="relative group">
              <img src={url} alt={`预览 ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => handleRemove(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={14} />
              </button>
            </div>)}
        </div>}
    </div>;
}