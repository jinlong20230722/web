// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/components/ui';
// @ts-ignore;
import { Save, X, FileText, Calendar, User, AlertCircle, Building2 } from 'lucide-react';

import IconSelector from '@/components/IconSelector';
const departmentOptions = [{
  value: '人事部',
  label: '人事部'
}, {
  value: '品质部',
  label: '品质部'
}, {
  value: '品宣部',
  label: '品宣部'
}, {
  value: '运营部',
  label: '运营部'
}, {
  value: '财务部',
  label: '财务部'
}];
export default function AnnouncementEditModal({
  open,
  onClose,
  onSuccess,
  mode,
  announcement,
  currentUserName,
  $w
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publisher_department: '人事部',
    icon: 'bell'
  });
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = $w.utils.toast ? $w.utils.toast : {
    toast: msg => console.log(msg)
  };

  // 初始化表单数据
  useEffect(() => {
    if (mode === 'edit' && announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        publisher_department: announcement.publisher_department || '人事部',
        icon: announcement.icon || 'bell'
      });
    } else {
      setFormData({
        title: '',
        content: '',
        publisher_department: '人事部',
        icon: 'bell'
      });
    }
  }, [mode, announcement, open]);

  // 表单验证
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: '验证失败',
        description: '请输入公告标题',
        variant: 'destructive'
      });
      return false;
    }
    if (!formData.content.trim()) {
      toast({
        title: '验证失败',
        description: '请输入公告内容',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  // 保存公告
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = Date.now();
      const data = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        publisher: currentUserName,
        publisher_department: formData.publisher_department,
        icon: formData.icon,
        updatedAt: now
      };
      if (mode === 'create') {
        // 新增公告
        data.publish_time = now;
        data.createdAt = now;
        await db.collection('announcement').add(data);
        toast({
          title: '新增成功',
          description: '公告已成功发布'
        });
      } else {
        // 编辑公告
        await db.collection('announcement').doc(announcement._id).update(data);
        toast({
          title: '更新成功',
          description: '公告已成功更新'
        });
      }
      onSuccess();
    } catch (error) {
      console.error('保存公告失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '保存公告失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {mode === 'create' ? '新增公告' : '编辑公告'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 公告标题和图标 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              公告标题 <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <IconSelector value={formData.icon} onChange={value => setFormData(prev => ({
                ...prev,
                icon: value
              }))} />
              </div>
              <div className="flex-1">
                <Input placeholder="请输入公告标题" value={formData.title} onChange={e => setFormData(prev => ({
                ...prev,
                title: e.target.value
              }))} maxLength={100} className="text-base" />
              </div>
            </div>
            <p className="text-xs text-slate-500">最多100个字符</p>
          </div>

          {/* 发布部门 */}
          <div className="space-y-2">
            <Label htmlFor="publisher_department" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              发布部门 <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.publisher_department} onValueChange={value => setFormData(prev => ({
            ...prev,
            publisher_department: value
          }))}>
              <SelectTrigger>
                <SelectValue placeholder="选择发布部门" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map(dept => <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* 公告内容 */}
          <div className="space-y-2">
            <Label htmlFor="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              公告内容 <span className="text-red-500">*</span>
            </Label>
            <Textarea id="content" placeholder="请输入公告内容，支持换行和基本格式" value={formData.content} onChange={e => setFormData(prev => ({
            ...prev,
            content: e.target.value
          }))} rows={12} className="resize-none" />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <AlertCircle className="h-3 w-3" />
              <span>提示：支持换行输入，建议分段落组织内容</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}