// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Users, UserCheck, UserX, UserPlus } from 'lucide-react';

export function PersonnelStats({
  personnel
}) {
  const totalPersonnel = personnel.length;
  const activePersonnel = personnel.filter(p => p.status === '在职').length;
  const inactivePersonnel = personnel.filter(p => p.status !== '在职').length;
  const thisMonthNew = personnel.filter(p => {
    if (!p.createdAt) return false;
    const joinDate = new Date(p.createdAt);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">总人数</p>
            <p className="text-white text-3xl font-bold">{totalPersonnel}</p>
            <p className="text-blue-200 text-xs mt-2">全部人员</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">在职人数</p>
            <p className="text-white text-3xl font-bold">{activePersonnel}</p>
            <p className="text-green-200 text-xs mt-2">正常工作</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-100 text-sm font-medium mb-1">离职人数</p>
            <p className="text-white text-3xl font-bold">{inactivePersonnel}</p>
            <p className="text-gray-200 text-xs mt-2">已离职</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <UserX className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium mb-1">本月入职</p>
            <p className="text-white text-3xl font-bold">{thisMonthNew}</p>
            <p className="text-orange-200 text-xs mt-2">新入职人员</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>;
}