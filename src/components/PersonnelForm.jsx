// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

export function PersonnelForm({
  isDialogOpen,
  setIsDialogOpen,
  editingPerson,
  formData,
  setFormData,
  handleSubmit
}) {
  return <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingPerson ? '编辑人员' : '添加人员'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">联系电话 *</Label>
                <Input id="phone" value={formData.phone} onChange={e => setFormData({
                ...formData,
                phone: e.target.value
              })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">所属部门 *</Label>
                <Input id="department" value={formData.department} onChange={e => setFormData({
                ...formData,
                department: e.target.value
              })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">职位 *</Label>
                <Input id="position" value={formData.position} onChange={e => setFormData({
                ...formData,
                position: e.target.value
              })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idCard">身份证号</Label>
              <Input id="idCard" value={formData.idCard} onChange={e => setFormData({
              ...formData,
              idCard: e.target.value
            })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">地址</Label>
              <Input id="address" value={formData.address} onChange={e => setFormData({
              ...formData,
              address: e.target.value
            })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">性别</Label>
                <Select value={formData.gender} onValueChange={value => setFormData({
                ...formData,
                gender: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">年龄</Label>
                <Input id="age" value={formData.age} onChange={e => setFormData({
                ...formData,
                age: e.target.value
              })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">紧急联系人</Label>
                <Input id="emergencyName" value={formData.emergencyName} onChange={e => setFormData({
                ...formData,
                emergencyName: e.target.value
              })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">紧急联系电话</Label>
                <Input id="emergencyPhone" value={formData.emergencyPhone} onChange={e => setFormData({
                ...formData,
                emergencyPhone: e.target.value
              })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select value={formData.status} onValueChange={value => setFormData({
              ...formData,
              status: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="在职">在职</SelectItem>
                  <SelectItem value="离职">离职</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editingPerson ? '更新' : '添加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>;
}