// @ts-ignore;
import React from 'react';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// 预定义的颜色方案
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

/**
 * 统计图表组件
 * @param {Object} props
 * @param {string} props.title - 图表标题
 * @param {Array} props.data - 图表数据
 * @param {string} props.dataKey - 数据键名
 * @param {string} props.nameKey - 名称键名
 * @param {string} props.type - 图表类型: 'pie' | 'bar'
 * @param {string} props.color - 主色调
 */
export function StatisticsChart({
  title,
  data,
  dataKey,
  nameKey,
  type = 'pie',
  color = '#3B82F6'
}) {
  if (!data || data.length === 0) {
    return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          暂无数据
        </div>
      </div>;
  }
  const renderPieChart = () => <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({
        name,
        percent
      }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill={color} dataKey={dataKey}>
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>;
  const renderBarChart = () => <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={nameKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} />
      </BarChart>
    </ResponsiveContainer>;
  return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {type === 'pie' ? renderPieChart() : renderBarChart()}
    </div>;
}