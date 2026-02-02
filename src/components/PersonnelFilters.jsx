// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { Calendar, Filter } from 'lucide-react';

export function PersonnelFilters({
  startDate,
  endDate,
  filterDepartment,
  filterPosition,
  setStartDate,
  setEndDate,
  setFilterDepartment,
  setFilterPosition,
  departmentOptions,
  positionOptions
}) {
  return <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-lg mb-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-700">筛选条件</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            入职日期开始
          </label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            入职日期结束
          </label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            所属部门
          </label>
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            职位
          </label>
          <Select value={filterPosition} onValueChange={setFilterPosition}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {positionOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>;
}