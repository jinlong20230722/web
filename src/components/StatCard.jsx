// @ts-ignore;
import React from 'react';

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue
}) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trendValue && <p className={`text-sm mt-2 ${trendColor}`}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trendValue}
            </p>}
        </div>
        <div className="p-3 rounded-lg bg-gray-100 text-gray-600">
          <Icon size={24} />
        </div>
      </div>
    </div>;
}