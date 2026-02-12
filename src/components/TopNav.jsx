// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Bell, User, LogOut, Settings } from 'lucide-react';
// @ts-ignore;
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui';

export function TopNav({
  currentUser
}) {
  return <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* 左侧标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">天顺保安管理平台</h1>
      </div>

      {/* 右侧操作区 */}
      <div className="flex items-center space-x-4">
        {/* 通知按钮 */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="text-gray-600" size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* 用户菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="text-white" size={16} />
              </div>
              <span className="text-gray-700 font-medium">
                {currentUser?.nickName || currentUser?.name || '管理员'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2" size={16} />
              <span>个人中心</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2" size={16} />
              <span>系统设置</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2" size={16} />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>;
}