// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { PieChart as PieChartIcon, BarChart3, LineChartIcon, BarChart } from 'lucide-react';

import { PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell, LineChart, Line } from 'recharts';
export function PersonnelCharts({
  chartType,
  setChartType,
  getChartData,
  getDepartmentData,
  getPositionData,
  getJoinTrendData
}) {
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  return <div className="space-y-4">
      {/* 图表类型切换 */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button onClick={() => setChartType('status')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${chartType === 'status' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
          <PieChartIcon className="w-4 h-4" />
          状态分布
        </button>
        <button onClick={() => setChartType('department')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${chartType === 'department' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
          <BarChart3 className="w-4 h-4" />
          部门分布
        </button>
        <button onClick={() => setChartType('position')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${chartType === 'position' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
          <BarChart3 className="w-4 h-4" />
          职位分布
        </button>
        <button onClick={() => setChartType('trend')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${chartType === 'trend' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
          <LineChartIcon className="w-4 h-4" />
          入职趋势
        </button>
      </div>

      {/* 图表展示区域 */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {chartType === 'status' && <>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
              人员状态分布
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={getChartData()} cx="50%" cy="50%" labelLine={false} label={entry => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {getChartData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </>}
        {chartType === 'department' && <>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              部门人员分布
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={getDepartmentData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{
              fontSize: 12
            }} />
                <YAxis tick={{
              fontSize: 12
            }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>}
        {chartType === 'position' && <>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              职位人员分布
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={getPositionData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{
              fontSize: 12
            }} />
                <YAxis tick={{
              fontSize: 12
            }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>}
        {chartType === 'trend' && <>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-blue-600" />
              入职趋势
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={getJoinTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{
              fontSize: 12
            }} />
                <YAxis tick={{
              fontSize: 12
            }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={3} dot={{
              r: 5
            }} activeDot={{
              r: 7
            }} />
              </LineChart>
            </ResponsiveContainer>
          </>}
      </div>
    </div>;
}