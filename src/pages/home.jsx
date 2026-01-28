// @ts-ignore;
import React, { useEffect, useState } from 'react';
// @ts-ignore;
import { Users, Clock, AlertCircle, Calendar, RefreshCw, Info } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { getRecords } from '@/lib/dataSource';
import { PageLayout } from '@/components/PageLayout';
export default function Home(props) {
  const {
    toast
  } = useToast();
  const [currentPage, setCurrentPage] = useState('data_cockpit');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [stats, setStats] = useState({
    personnelCount: 0,
    todayAttendance: 0,
    todayEvents: 0,
    currentLeave: 0
  });

  // 将 $w 注入到 window 对象，以便其他页面可以访问
  useEffect(() => {
    if (props.$w) {
      window.$w = props.$w;
    }
  }, [props.$w]);

  // 页面切换处理
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    props.$w?.utils?.navigateTo({
      pageId: pageId,
      params: {}
    });
  };

  // 加载数据驾驶舱数据
  const loadCockpitData = async () => {
    try {
      // 并行加载所有数据
      const [personnelResult, attendanceResult, eventResult, leaveResult] = await Promise.all([getRecords('personnel', {}, 100, 1, [{
        createdAt: 'desc'
      }]), getRecords('attendance', {}, 100, 1, [{
        checkInTime: 'desc'
      }]), getRecords('event_report', {}, 100, 1, [{
        reportTime: 'desc'
      }]), getRecords('leave_request', {}, 100, 1, [{
        createdAt: 'desc'
      }])]);

      // 计算人员总数（在职）
      const personnelCount = personnelResult?.records?.filter(p => p.status === '在职' || p.status === 'active').length || 0;

      // 计算今日打卡人数
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const todayAttendance = attendanceResult?.records?.filter(record => {
        const checkInTime = new Date(record.checkInTime);
        return checkInTime >= today && checkInTime < tomorrow;
      }).length || 0;

      // 计算今日事件上报数量
      const todayEvents = eventResult?.records?.filter(record => {
        const reportTime = new Date(record.reportTime);
        return reportTime >= today && reportTime < tomorrow;
      }).length || 0;

      // 计算当前请假人数（已通过且时间覆盖当前）
      const now = new Date();
      const currentLeave = leaveResult?.records?.filter(record => {
        if (record.approvalStatus !== '已通过' && record.approvalStatus !== 'approved') {
          return false;
        }
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);
        return now >= startTime && now <= endTime;
      }).length || 0;
      setStats({
        personnelCount,
        todayAttendance,
        todayEvents,
        currentLeave
      });
      setLastUpdateTime(new Date());
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载数据驾驶舱失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    setRefreshing(true);
    loadCockpitData();
  };

  // 初始加载数据
  useEffect(() => {
    loadCockpitData();
  }, []);

  // 定时刷新数据（每30秒自动刷新一次）
  useEffect(() => {
    const interval = setInterval(() => {
      loadCockpitData();
    }, 30000); // 30秒刷新一次

    return () => clearInterval(interval);
  }, []);
  return <PageLayout currentPage={currentPage} onPageChange={handlePageChange} title="天顺保安管理平台" subtitle="v1.0.0 - 企业级管理系统" user={props.$w?.auth?.currentUser}>
      <div className="space-y-6">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info size={16} />
            <span>数据实时同步中（每30秒自动刷新）</span>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>刷新数据</span>
          </button>
        </div>

        {/* 统计卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 人员总数卡片 */}
          <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">人员总数</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '-' : stats.personnelCount}
                </p>
                <p className="text-xs text-gray-500 mt-2">在职保安人员</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* 今日打卡人数卡片 */}
          <div className="bg-white rounded-xl p-6 border-l-4 border-green-500 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">今日打卡</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '-' : stats.todayAttendance}
                </p>
                <p className="text-xs text-gray-500 mt-2">人</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* 今日事件上报卡片 */}
          <div className="bg-white rounded-xl p-6 border-l-4 border-orange-500 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">今日事件</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '-' : stats.todayEvents}
                </p>
                <p className="text-xs text-gray-500 mt-2">上报数量</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          {/* 当前请假人数卡片 */}
          <div className="bg-white rounded-xl p-6 border-l-4 border-purple-500 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">当前请假</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '-' : stats.currentLeave}
                </p>
                <p className="text-xs text-gray-500 mt-2">人</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 数据说明区域 */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">数据说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">人员总数</p>
                <p className="text-xs text-gray-500 mt-1">统计所有在职保安人员数量</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">今日打卡</p>
                <p className="text-xs text-gray-500 mt-1">统计今日已完成打卡的人员数量</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">今日事件</p>
                <p className="text-xs text-gray-500 mt-1">统计今日上报的事件数量</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">当前请假</p>
                <p className="text-xs text-gray-500 mt-1">统计当前时间正在请假的人员数量</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-medium">最后更新时间：</span>
              {lastUpdateTime ? lastUpdateTime.toLocaleString('zh-CN') : '未更新'}
            </p>
          </div>
        </div>
      </div>
    </PageLayout>;
}