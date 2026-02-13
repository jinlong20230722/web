// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { X, Save } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, useToast } from '@/components/ui';

import ImageUpload from '@/components/ImageUpload';
export default function PersonnelEditModal({
  record,
  onClose,
  onSuccess,
  $w
}) {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 验证手机号格式
  const validatePhone = phone => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // 验证身份证号格式
  const validateIdNumber = idNumber => {
    if (!idNumber) return true; // 身份证号可以为空
    const idRegex = /^\d{15}$|^\d{17}[\dXx]$/;
    return idRegex.test(idNumber);
  };

  // 验证表单
  const validateForm = () => {
    const newErrors = {};

    // 验证手机号
    if (!formData.phone) {
      newErrors.phone = '请输入手机号';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = '请输入正确的手机号';
    }

    // 验证身份证号
    if (formData.id_number && !validateIdNumber(formData.id_number)) {
      newErrors.id_number = '请输入正确的身份证号';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  useEffect(() => {
    if (record) {
      setFormData({
        name: record.name || '',
        phone: record.phone || '',
        department: record.department || '',
        position: record.position || '',
        emergency_contact_name: record.emergency_contact_name || '',
        emergency_contact_phone: record.emergency_contact_phone || '',
        id_number: record.id_number || '',
        id_address: record.id_address || '',
        gender: record.gender || '',
        age: record.age || '',
        employment_status: record.employment_status || '在职',
        id_card_front_image: record.id_card_front_image || '',
        id_card_back_image: record.id_card_back_image || '',
        certificate_images: record.certificate_images || []
      });
    }
  }, [record]);
  const handleSubmit = async e => {
    e.preventDefault();

    // 验证表单
    if (!validateForm()) {
      return;
    }

    // 检查图片数据格式
    console.log('提交前的图片数据:', {
      id_card_front_image: formData.id_card_front_image,
      id_card_back_image: formData.id_card_back_image,
      certificate_images: formData.certificate_images
    });

    // 验证图片数据格式
    if (typeof formData.id_card_front_image !== 'string' && formData.id_card_front_image !== '') {
      console.error('身份证正面照片格式错误:', typeof formData.id_card_front_image);
      toast({
        title: '数据错误',
        description: '身份证正面照片格式不正确',
        variant: 'destructive'
      });
      return;
    }
    if (typeof formData.id_card_back_image !== 'string' && formData.id_card_back_image !== '') {
      console.error('身份证反面照片格式错误:', typeof formData.id_card_back_image);
      toast({
        title: '数据错误',
        description: '身份证反面照片格式不正确',
        variant: 'destructive'
      });
      return;
    }
    if (!Array.isArray(formData.certificate_images)) {
      console.error('证书照片格式错误:', typeof formData.certificate_images);
      toast({
        title: '数据错误',
        description: '证书照片格式不正确',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      const submitData = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        position: formData.position,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        id_number: formData.id_number,
        id_address: formData.id_address,
        gender: formData.gender,
        age: formData.age ? Number(formData.age) : null,
        employment_status: formData.employment_status,
        id_card_front_image: formData.id_card_front_image || '',
        id_card_back_image: formData.id_card_back_image || '',
        certificate_images: formData.certificate_images || []
      };
      console.log('提交数据:', submitData);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaUpdateV2',
        params: {
          data: submitData,
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: record._id
                }
              }]
            }
          }
        }
      });
      console.log('更新成功:', result);
      if (result.count > 0) {
        toast({
          title: '保存成功',
          description: '人员信息已更新'
        });
        onSuccess();
      } else {
        toast({
          title: '保存失败',
          description: '保存失败，请重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('保存失败:', error);
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      let errorMessage = error.message || '保存失败，请重试';

      // 尝试解析更详细的错误信息
      if (error.message && error.message.includes('数据格式校验失败')) {
        errorMessage = '数据格式校验失败，请检查图片上传是否完成';
      }
      toast({
        title: '保存失败',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除该字段的错误提示
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 处理图片上传
  const handleImageUpload = (field, files) => {
    setFormData(prev => ({
      ...prev,
      [field]: files
    }));
  };
  if (!record) return null;
  return <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">编辑人员信息</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
                <Input value={formData.gender} onChange={e => handleChange('gender', e.target.value)} placeholder="男/女" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
                <Input type="number" value={formData.age} onChange={e => handleChange('age', e.target.value)} placeholder="请输入年龄" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号 *</label>
                <Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} required className={errors.phone ? 'border-red-500' : ''} />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属部门</label>
                <Input value={formData.department} onChange={e => handleChange('department', e.target.value)} placeholder="请输入部门" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">职务</label>
                <Input value={formData.position} onChange={e => handleChange('position', e.target.value)} placeholder="请输入职务" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">在职状态</label>
                <Input value={formData.employment_status} onChange={e => handleChange('employment_status', e.target.value)} placeholder="在职/离职/试用期" />
              </div>
            </div>
          </div>

          {/* 身份证信息 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">身份证信息</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">身份证号码</label>
                <Input value={formData.id_number} onChange={e => handleChange('id_number', e.target.value)} placeholder="请输入身份证号码" className={errors.id_number ? 'border-red-500' : ''} />
                {errors.id_number && <p className="text-red-500 text-sm mt-1">{errors.id_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">身份证详细地址</label>
                <Input value={formData.id_address} onChange={e => handleChange('id_address', e.target.value)} placeholder="请输入身份证地址" />
              </div>
            </div>
          </div>

          {/* 紧急联系人 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">紧急联系人</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <Input value={formData.emergency_contact_name} onChange={e => handleChange('emergency_contact_name', e.target.value)} placeholder="请输入紧急联系人姓名" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                <Input value={formData.emergency_contact_phone} onChange={e => handleChange('emergency_contact_phone', e.target.value)} placeholder="请输入紧急联系人电话" />
              </div>
            </div>
          </div>

          {/* 证件照片 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">证件照片</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 身份证正面 */}
              <ImageUpload label="身份证正面照片" value={formData.id_card_front_image} onChange={files => handleImageUpload('id_card_front_image', files)} accept="image/*" $w={$w} />

              {/* 身份证反面 */}
              <ImageUpload label="身份证反面照片" value={formData.id_card_back_image} onChange={files => handleImageUpload('id_card_back_image', files)} accept="image/*" $w={$w} />

              {/* 证书照片 */}
              <ImageUpload label="证书照片" value={formData.certificate_images} onChange={files => handleImageUpload('certificate_images', files)} multiple={true} maxCount={5} accept="image/*" $w={$w} />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
}