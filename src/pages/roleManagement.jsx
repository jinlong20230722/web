// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Shield, User, Save, X } from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { hasPermission, getUserRole, getRoleDisplayName } from '@/lib/permissions';
export default function RoleManagement(props) {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const {
    toast
  } = useToast();
  const {
    currentUser
  } = props.$w.auth;

  // 检查是否有权限访问
  if (!hasPermission(currentUser, 'manage:roles')) {
    return <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <Shield size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">权限不足</h2>
          <p className="text-gray-600">您没有权限访问角色管理页面</p>
        </div>
      </div>;
  }

  // 加载用户列表
  const loadUserList = async () => {
    setLoading(true);
    try {
      // 从 personnel 表获取用户列表
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 1000
        }
      });

      // 为每个用户添加角色信息（这里假设 role 字段存储在 personnel 表中）
      const users = (result.records || []).map(user => ({
        ...user,
        role: user.role || 'staff' // 默认为普通员工
      }));
      setUserList(users);
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载用户列表失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUserList();
  }, []);

  // 打开编辑对话框
  const handleEdit = user => {
    setSelectedUser(user);
    setSelectedRole(user.role || 'staff');
    setIsEditDialogOpen(true);
  };

  // 保存角色
  const handleSaveRole = async () => {
    try {
      await props.$w.cloud.callDataSource({
        dataSourceName: 'personnel',
        methodName: 'wedaUpdateRecord',
        params: {
          data: {
            _id: selectedUser._id,
            role: selectedRole
          }
        }
      });
      toast({
        title: '保存成功',
        description: `已将 ${selectedUser.name} 的角色设置为 ${getRoleDisplayName(selectedRole)}`
      });
      setIsEditDialogOpen(false);
      loadUserList();
    } catch (error) {
      toast({
        title: '保存失败',
        description: error.message || '保存角色失败',
        variant: 'destructive'
      });
    }
  };

  // 获取角色徽章
  const getRoleBadge = role => {
    const config = {
      admin: {
        bg: 'bg-red-100',
        text: 'text-red-800'
      },
      manager: {
        bg: 'bg-blue-100',
        text: 'text-blue-800'
      },
      staff: {
        bg: 'bg-gray-100',
        text: 'text-gray-800'
      }
    };
    const style = config[role] || config.staff;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {getRoleDisplayName(role)}
      </span>;
  };

  // 过滤用户列表
  const filteredUsers = userList.filter(user => user.name && user.name.includes(searchKeyword) || user.phone && user.phone.includes(searchKeyword));
  return <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage="roleManagement" $w={props.$w} />
      <div className="flex-1 flex flex-col">
        <TopNav currentUser={currentUser} />
        <main className="flex-1 p-6 overflow-auto">
          {/* 页面标题 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">角色管理</h2>
            <p className="text-gray-500 mt-1">管理用户角色和权限</p>
          </div>

          {/* 操作栏 */}
          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input placeholder="搜索姓名或手机号..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>
          </div>

          {/* 数据表格 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">姓名</TableHead>
                  <TableHead className="font-semibold">手机号</TableHead>
                  <TableHead className="font-semibold">部门</TableHead>
                  <TableHead className="font-semibold">职务</TableHead>
                  <TableHead className="font-semibold">当前角色</TableHead>
                  <TableHead className="font-semibold text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      加载中...
                    </TableCell>
                  </TableRow> : filteredUsers.length === 0 ? <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow> : filteredUsers.map(user => <TableRow key={user._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.position}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                          <Shield size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {/* 编辑角色对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>修改用户角色</DialogTitle>
            <DialogDescription>
              为 {selectedUser?.name} 分配角色
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>当前角色</Label>
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="font-medium">{selectedUser && getRoleBadge(selectedUser.role)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>选择新角色</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="manager">部门经理</SelectItem>
                  <SelectItem value="staff">普通员工</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>角色说明：</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• 管理员：拥有所有权限</li>
                <li>• 部门经理：可查看数据、审批请假</li>
                <li>• 普通员工：只能查看数据</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X size={16} className="mr-2" />
              取消
            </Button>
            <Button onClick={handleSaveRole}>
              <Save size={16} className="mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}