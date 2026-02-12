// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { LayoutDashboard, Users, Clock, Calendar, AlertTriangle, MessageSquare, Megaphone, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

import { canAccessPage, hasPermission } from '@/lib/permissions';
export function Sidebar({
  currentPage,
  $w
}) {
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = [{
    id: 'home',
    label: '首页',
    icon: LayoutDashboard
  }, {
    id: 'personnel',
    label: '人员管理',
    icon: Users
  }, {
    id: 'attendance',
    label: '签到打卡',
    icon: Clock
  }, {
    id: 'leave',
    label: '请假管理',
    icon: Calendar
  }, {
    id: 'event',
    label: '事件管理',
    icon: AlertTriangle
  }, {
    id: 'feedback',
    label: '反馈管理',
    icon: MessageSquare
  }, {
    id: 'announcement',
    label: '公告管理',
    icon: Megaphone
  }, {
    id: 'roleManagement',
    label: '角色管理',
    icon: Shield,
    requirePermission: 'manage:roles'
  }];
  const handleMenuClick = pageId => {
    if ($w && $w.utils && $w.utils.navigateTo) {
      $w.utils.navigateTo({
        pageId: pageId,
        params: {}
      });
    }
  };
  const currentUser = $w?.auth?.currentUser;
  const accessibleMenuItems = menuItems.filter(item => {
    // 检查页面访问权限
    if (!canAccessPage(currentUser, item.id)) {
      return false;
    }
    // 检查特定权限要求
    if (item.requirePermission && !hasPermission(currentUser, item.requirePermission)) {
      return false;
    }
    return true;
  });
  return <div className={`bg-[#1E40AF] min-h-screen transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo 区域 */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-blue-800">
        {!collapsed && <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">天</span>
            </div>
            <span className="text-white font-semibold text-lg">天顺保安</span>
          </div>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-blue-200 hover:text-white transition-colors">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* 菜单列表 */}
      <nav className="p-4 space-y-2">
        {accessibleMenuItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return <button key={item.id} onClick={() => handleMenuClick(item.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-blue-800 hover:text-white'} ${collapsed ? 'justify-center' : ''}`}>
              <Icon size={20} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>;
      })}
      </nav>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
        {!collapsed && <div className="text-blue-200 text-xs">
            <p>© 2026 天顺保安</p>
            <p className="mt-1">管理平台 v1.0</p>
          </div>}
      </div>
    </div>;
}