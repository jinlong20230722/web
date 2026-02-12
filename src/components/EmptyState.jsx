// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Inbox, Plus } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';

export function EmptyState({
  title = '暂无数据',
  description = '当前没有相关数据',
  actionText,
  onAction,
  icon: Icon = Inbox
}) {
  return <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center mb-6 max-w-md">{description}</p>
      {actionText && onAction && <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2" size={16} />
          {actionText}
        </Button>}
    </div>;
}