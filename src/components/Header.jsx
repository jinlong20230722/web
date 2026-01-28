// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Bell, Settings, LogOut, User } from 'lucide-react';

export function Header({
  title,
  subtitle,
  user,
  onSettingsClick
}) {
  return <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between">
        {/* 左侧标题区域 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {title || '天顺保安管理平台'}
          </h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>}
        </div>

        {/* 右侧操作区域 */}
        <div className="flex items-center gap-4">
          {/* 通知图标 */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* 设置图标 */}
          <button onClick={onSettingsClick} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={20} className="text-gray-600" />
          </button>

          {/* 分隔线 */}
          <div className="w-px h-8 bg-gray-200"></div>

          {/* 用户信息 */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold shadow-md flex-shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-sm overflow-hidden">
              <p className="font-medium text-gray-700 truncate">
                {user?.name || '管理员'}
              </p>
              <p className="text-gray-500 truncate">
                {user?.type || '系统管理员'}
              </p>
            </div>
          </div>

          {/* 退出按钮 */}
          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="退出登录">
            <LogOut size={20} className="text-gray-600 hover:text-red-600" />
          </button>
        </div>
      </div>
    </header>;
}