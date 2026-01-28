// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Users, Clock, Calendar, AlertCircle, MessageSquare, Megaphone, LayoutDashboard, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

export function Sidebar({
  currentPage,
  onPageChange,
  collapsed,
  onToggle
}) {
  const menuItems = [{
    id: 'data_cockpit',
    label: '数据驾驶舱',
    icon: BarChart3,
    description: '实时监控'
  }, {
    id: 'personnel',
    label: '人员信息',
    icon: Users,
    description: '保安人员管理'
  }, {
    id: 'attendance',
    label: '打卡签到',
    icon: Clock,
    description: '考勤记录'
  }, {
    id: 'leave_request',
    label: '请假销假',
    icon: Calendar,
    description: '请假管理'
  }, {
    id: 'event_report',
    label: '事件上报',
    icon: AlertCircle,
    description: '事件处理'
  }, {
    id: 'feedback',
    label: '意见反馈',
    icon: MessageSquare,
    description: '反馈管理'
  }, {
    id: 'announcement',
    label: '公告信息',
    icon: Megaphone,
    description: '公告发布'
  }];
  return <div className={`bg-[#1E3A8A] text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col shadow-xl`}>
      {/* Logo 区域 */}
      <div className="p-4 border-b border-blue-800">
        <div className="flex items-center justify-between">
          {!collapsed && <div>
              <h1 className="text-lg font-bold tracking-wide">天顺保安</h1>
              <p className="text-xs text-blue-300 mt-0.5">管理平台 v1.0.0</p>
            </div>}
          <button onClick={onToggle} className="p-1.5 hover:bg-blue-800 rounded-lg transition-colors" title={collapsed ? '展开菜单' : '收起菜单'}>
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return <li key={item.id}>
                <button onClick={() => onPageChange(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-100 hover:bg-blue-800 hover:text-white'}`} title={collapsed ? `${item.label} - ${item.description}` : ''}>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-md"></div>}
                  <Icon size={20} className={isActive ? 'text-white' : 'text-blue-300'} />
                  {!collapsed && <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-blue-300">{item.description}</span>
                    </div>}
                </button>
              </li>;
        })}
        </ul>
      </nav>

      {/* 底部信息 */}
      <div className="p-4 border-t border-blue-800">
        {!collapsed && <div className="text-center">
            <p className="text-xs text-blue-300">© 2026 天顺保安</p>
            <p className="text-xs text-blue-400 mt-1">企业级管理系统</p>
          </div>}
      </div>
    </div>;
}