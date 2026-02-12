// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { X, Save } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, useToast } from '@/components/ui';

import ImageUpload from '@/components/ImageUpload';
export default function PersonnelAddModal({
  onClose,
  onSuccess,
  $w
}) {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    age: '',
    id_number: '',
    id_address: '',
    department: '',
    position: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    id_card_front_image: [],
    id_card_back_image: [],
    certificate_images: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 固定的部门列表
  const departments = ['保安一部', '保安二部', '保安三部', '保安四部', '保安五部', '保安六部', '保安七部', '保安八部', '人事部', '运营部', '财务部', '物资部', '品质部', '品宣部', '外勤部'];

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    // 姓名验证
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }

    // 手机号验证：必须是11位数字，以1开头，第二位是3-9
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号';
    }

    // 性别验证
    if (!formData.gender) {
      newErrors.gender = '请选择性别';
    }

    // 年龄验证
    if (!formData.age) {
      newErrors.age = '请输入年龄';
    } else if (isNaN(formData.age) || formData.age < 18 || formData.age > 65) {
      newErrors.age = '年龄必须在18-65岁之间';
    }

    // 身份证号验证：必须是15位或18位，18位最后一位可以是数字或X
    if (!formData.id_number.trim()) {
      newErrors.id_number = '请输入身份证号';
    } else if (!/^\d{15}$|^\d{17}[\dXx]$/.test(formData.id_number)) {
      newErrors.id_number = '请输入正确的身份证号';
    }

    // 部门验证
    if (!formData.department) {
      newErrors.department = '请选择所属部门';
    }

    // 职务验证
    if (!formData.position.trim()) {
      newErrors.position = '请输入职务';
    }

    // 紧急联系人姓名验证
    if (!formData.emergency_contact_name.trim()) {
      newErrors.emergency_contact_name = '请输入紧急联系人姓名';
    }

    // 紧急联系人电话验证：必须是11位数字，以1开头，第二位是3-9
    if (!formData.emergency_contact_phone.trim()) {
      newErrors.emergency_contact_phone = '请输入紧急联系人电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.emergency_contact_phone)) {
      newErrors.emergency_contact_phone = '请输入正确的紧急联系人电话';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理图片上传
  const handleImageUpload = (field, files) => {
    setFormData(prev => ({
      ...prev,
      [field]: files
    }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            name: formData.name,
            phone: formData.phone,
            gender: formData.gender,
            age: Number(formData.age),
            id_number: formData.id_number,
            id_address: formData.id_address,
            department: formData.department,
            position: formData.position,
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_phone: formData.emergency_contact_phone,
            id_card_front_image: formData.id_card_front_image,
            id_card_back_image: formData.id_card_back_image,
            certificate_images: formData.certificate_images,
            employment_status: '在职',
            register_time: Date.now()
          }
        }
      });
      toast({
        title: '添加成功',
        description: '人员信息已添加'
      });
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      toast({
        title: '添加失败',
        description: error.message || '添加人员信息失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  return <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">添加人员</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 姓名 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">姓名 <span className="text-red-500">*</span></Label>
              <Input value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="请输入姓名" className={errors.name ? 'border-red-500' : ''} />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* 手机号 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">手机号 <span className="text-red-500">*</span></Label>
              <Input value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="请输入11位手机号" maxLength={11} className={errors.phone ? 'border-red-500' : ''} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* 性别 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">性别 <span className="text-red-500">*</span></Label>
              <Select value={formData.gender} onValueChange={value => handleInputChange('gender', value)}>
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="请选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="男">男</SelectItem>
                  <SelectItem value="女">女</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
            </div>

            {/* 年龄 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">年龄 <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.age} onChange={e => handleInputChange('age', e.target.value)} placeholder="请输入年龄" min={18} max={65} className={errors.age ? 'border-red-500' : ''} />
              {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
            </div>

            {/* 身份证号 */}
            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium">身份证号 <span className="text-red-500">*</span></Label>
              <Input value={formData.id_number} onChange={e => handleInputChange('id_number', e.target.value)} placeholder="请输入15位或18位身份证号" maxLength={18} className={errors.id_number ? 'border-red-500' : ''} />
              {errors.id_number && <p className="text-sm text-red-500">{errors.id_number}</p>}
            </div>

            {/* 身份证地址 */}
            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium">身份证地址</Label>
              <Input value={formData.id_address} onChange={e => handleInputChange('id_address', e.target.value)} placeholder="请输入身份证地址" />
            </div>

            {/* 所属部门 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">所属部门 <span className="text-red-500">*</span></Label>
              <Select value={formData.department} onValueChange={value => handleInputChange('department', value)}>
                <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                  <SelectValue placeholder="请选择部门" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
            </div>

            {/* 职务 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">职务 <span className="text-red-500">*</span></Label>
              <Input value={formData.position} onChange={e => handleInputChange('position', e.target.value)} placeholder="请输入职务" className={errors.position ? 'border-red-500' : ''} />
              {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
            </div>

            {/* 紧急联系人姓名 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">紧急联系人姓名 <span className="text-red-500">*</span></Label>
              <Input value={formData.emergency_contact_name} onChange={e => handleInputChange('emergency_contact_name', e.target.value)} placeholder="请输入紧急联系人姓名" className={errors.emergency_contact_name ? 'border-red-500' : ''} />
              {errors.emergency_contact_name && <p className="text-sm text-red-500">{errors.emergency_contact_name}</p>}
            </div>

            {/* 紧急联系人电话 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">紧急联系人电话 <span className="text-red-500">*</span></Label>
              <Input value={formData.emergency_contact_phone} onChange={e => handleInputChange('emergency_contact_phone', e.target.value)} placeholder="请输入11位手机号" maxLength={11} className={errors.emergency_contact_phone ? 'border-red-500' : ''} />
              {errors.emergency_contact_phone && <p className="text-sm text-red-500">{errors.emergency_contact_phone}</p>}
            </div>
          </div>

          {/* 图片上传区域 */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">证件照片上传</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 身份证正面 */}
              <ImageUpload label="身份证正面照片" value={formData.id_card_front_image} onChange={files => handleImageUpload('id_card_front_image', files)} accept="image/*" />

              {/* 身份证反面 */}
              <ImageUpload label="身份证反面照片" value={formData.id_card_back_image} onChange={files => handleImageUpload('id_card_back_image', files)} accept="image/*" />

              {/* 证书照片 */}
              <ImageUpload label="证书照片" value={formData.certificate_images} onChange={files => handleImageUpload('certificate_images', files)} multiple={true} maxCount={5} accept="image/*" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              取消
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
}