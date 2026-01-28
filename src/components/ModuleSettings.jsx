// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { X, LayoutGrid, PieChart, BarChart3, Info } from 'lucide-react';

export function ModuleSettings({
  isOpen,
  onClose,
  modules,
  onToggle
}) {
  if (!isOpen) return null;
  const moduleGroups = [{
    id: 'stats',
    name: '统计卡片',
    icon: LayoutGrid,
    modules: ['personnelCount', 'todayAttendance', 'todayEvents', 'currentLeave']
  }, {
    id: 'charts',
    name: '图表分析',
    icon: PieChart,
    modules: ['departmentChart', 'attendanceChart', 'eventTypeChart', 'eventStatusChart', 'leaveTypeChart', 'leaveStatusChart']
  }, {
    id: 'info',
    name: '数据说明',
    icon: Info,
    modules: ['dataInfo']
  }];
  const moduleLabels = {
    personnelCount: '人员总数',
    todayAttendance: '今日打卡',
    todayEvents: '今日事件',
    currentLeave: '当前请假',
    departmentChart: '部门分布',
    attendanceChart: '打卡状态',
    eventTypeChart: '事件类型分布',
    eventStatusChart: '事件处理状态',
    leaveTypeChart: '请假类型分布',
    leaveStatusChart: '请假审批状态',
    dataInfo: '数据说明'
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">模块设置</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {moduleGroups.map(group => {
          const Icon = group.icon;
          return <div key={group.id} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} className="text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-700">{group.name}</h3>
                </div>
                <div className="space-y-2 pl-6">
                  {group.modules.map(moduleId => <label key={moduleId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <span className="text-sm text-gray-700">{moduleLabels[moduleId]}</span>
                      <div className="relative">
                        <input type="checkbox" checked={modules[moduleId]} onChange={() => onToggle(moduleId)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>)}
                </div>
              </div>;
        })}
        </div>

        {/* 底部操作 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            完成
          </button>
        </div>
      </div>
    </div>;
}