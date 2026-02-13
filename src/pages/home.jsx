// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Users, Clock, Calendar, AlertTriangle, MessageSquare, Megaphone, TrendingUp, Shield, CheckCircle } from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
export default function Home(props) {
  const {
    currentUser
  } = props.$w.auth;
  const stats = [{
    title: '总人员数',
    value: '128',
    icon: Users,
    color: 'bg-blue-500',
    change: '+12%'
  }, {
    title: '今日打卡',
    value: '115',
    icon: Clock,
    color: 'bg-green-500',
    change: '+8%'
  }, {
    title: '待审批请假',
    value: '5',
    icon: Calendar,
    color: 'bg-orange-500',
    change: '-2'
  }, {
    title: '待处理事件',
    value: '3',
    icon: AlertTriangle,
    color: 'bg-red-500',
    change: '+1'
  }, {
    title: '未读反馈',
    value: '8',
    icon: MessageSquare,
    color: 'bg-purple-500',
    change: '+3'
  }, {
    title: '最新公告',
    value: '2',
    icon: Megaphone,
    color: 'bg-indigo-500',
    change: '0'
  }];
  const recentActivities = [{
    type: 'checkin',
    user: '张三',
    time: '08:30',
    desc: '完成打卡'
  }, {
    type: 'leave',
    user: '李四',
    time: '09:15',
    desc: '提交请假申请'
  }, {
    type: 'event',
    user: '王五',
    time: '10:20',
    desc: '上报事件'
  }, {
    type: 'feedback',
    user: '赵六',
    time: '11:00',
    desc: '提交意见反馈'
  }, {
    type: 'checkin',
    user: '孙七',
    time: '12:30',
    desc: '完成打卡'
  }];
  const getActivityIcon = type => {
    switch (type) {
      case 'checkin':
        return <Clock className="text-green-500" size={20} />;
      case 'leave':
        return <Calendar className="text-orange-500" size={20} />;
      case 'event':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'feedback':
        return <MessageSquare className="text-purple-500" size={20} />;
      default:
        return <CheckCircle className="text-blue-500" size={20} />;
    }
  };
  return <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage="home" $w={props.$w} />
      
      <div className="flex-1 flex flex-col">
        <TopNav currentUser={currentUser} />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* 欢迎横幅 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  欢迎回来，{currentUser?.nickName || currentUser?.name || '管理员'}！
                </h2>
                <p className="text-blue-100 text-lg">
                  今天是 {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
                </p>
              </div>
              <div className="hidden md:block">
                <Shield className="text-white opacity-20" size={120} />
              </div>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {stats.map((stat, index) => {
            const Icon = stat.icon;
            return <div key={index} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div className={`flex items-center text-sm ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                      <TrendingUp size={16} className="mr-1" />
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                </div>;
          })}
          </div>

          {/* 内容区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 快捷操作 */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">快捷操作</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[{
                label: '添加人员',
                icon: Users,
                color: 'bg-blue-500'
              }, {
                label: '查看打卡',
                icon: Clock,
                color: 'bg-green-500'
              }, {
                label: '审批请假',
                icon: Calendar,
                color: 'bg-orange-500'
              }, {
                label: '处理事件',
                icon: AlertTriangle,
                color: 'bg-red-500'
              }, {
                label: '查看反馈',
                icon: MessageSquare,
                color: 'bg-purple-500'
              }, {
                label: '发布公告',
                icon: Megaphone,
                color: 'bg-indigo-500'
              }].map((action, index) => {
                const Icon = action.icon;
                const handleActionClick = () => {
                  const pageMap = {
                    '添加人员': 'personnel',
                    '查看打卡': 'attendance',
                    '审批请假': 'leave',
                    '处理事件': 'event',
                    '查看反馈': 'feedback',
                    '发布公告': 'announcement'
                  };
                  const pageId = pageMap[action.label];
                  if (pageId) {
                    props.$w.utils.navigateTo({
                      pageId,
                      params: {}
                    });
                  }
                };
                return <button key={index} onClick={handleActionClick} className={`flex flex-col items-center justify-center p-4 rounded-lg ${action.color} hover:opacity-90 transition-opacity`}>
                      <Icon className="text-white" size={32} />
                      <span className="text-white font-medium mt-2">{action.label}</span>
                    </button>;
              })}
              </div>
            </div>

            {/* 最近活动 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">最近活动</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{activity.user}</p>
                      <p className="text-gray-500 text-sm">{activity.desc}</p>
                    </div>
                    <span className="text-gray-400 text-sm">{activity.time}</span>
                  </div>)}
              </div>
            </div>
          </div>

          {/* 系统提示 */}
          <div className="mt-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-white" size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">系统提示</h4>
                <p className="text-gray-600">
                  数据驾驶舱功能正在开发中，即将为您提供更丰富的数据分析和可视化功能。
                  敬请期待！
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>;
}