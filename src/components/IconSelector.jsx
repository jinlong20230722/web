// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Bell, AlertTriangle, Award } from 'lucide-react';

const iconOptions = [{
  id: 'bell',
  name: '通知',
  icon: Bell,
  color: 'text-blue-500'
}, {
  id: 'warning',
  name: '警告',
  icon: AlertTriangle,
  color: 'text-yellow-500'
}, {
  id: 'award',
  name: '表彰',
  icon: Award,
  color: 'text-amber-500'
}];
export default function IconSelector({
  value,
  onChange
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedIcon = iconOptions.find(opt => opt.id === value);
  const SelectedIcon = selectedIcon?.icon || Bell;
  return <div className="relative">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
        <SelectedIcon className={`h-5 w-5 ${selectedIcon?.color || 'text-gray-500'}`} />
        <span className="text-sm text-gray-700">{selectedIcon?.name || '选择图标'}</span>
        <span className="text-gray-400">▼</span>
      </button>
      
      {isOpen && <div className="absolute z-10 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">选择图标</p>
          </div>
          <div className="p-2 grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {iconOptions.map(option => {
          const Icon = option.icon;
          const isSelected = value === option.id;
          return <button key={option.id} type="button" onClick={() => {
            onChange(option.id);
            setIsOpen(false);
          }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100 border-2 border-transparent'}`}>
                  <Icon className={`h-6 w-6 ${option.color}`} />
                  <span className="text-xs text-gray-600">{option.name}</span>
                </button>;
        })}
          </div>
        </div>}
    </div>;
}