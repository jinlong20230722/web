// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Users, Clock, AlertCircle, Calendar, RefreshCw, Info, Maximize2, Minimize2, TrendingUp, TrendingDown, Activity, BarChart3, PieChart, LineChart } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

// @ts-ignore;
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getRecords } from '@/lib/dataSource';
import { PageLayout } from '@/components/PageLayout';
export default function DataCockpit(props) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState({
    personnelCount: 0,
    todayAttendance: 0,
    todayEvents: 0,
    currentLeave: 0
  });
  const [chartData, setChartData] = useState({
    weeklyAttendance: [],
    monthlyEvents: [],
    departmentDistribution: [],
    attendanceTrend: []
  });
  const containerRef = useRef(null);

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

      // 生成图表数据
      generateChartData(attendanceResult?.records || [], eventResult?.records || [], personnelResult?.records || []);
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

  // 生成图表数据
  const generateChartData = (attendanceRecords, eventRecords, personnelRecords) => {
    // 周打卡数据（柱形图）
    const weeklyAttendance = [];
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      const count = attendanceRecords.filter(r => {
        const checkInTime = new Date(r.checkInTime);
        return checkInTime >= dayStart && checkInTime <= dayEnd;
      }).length;
      weeklyAttendance.push({
        name: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        value: count
      });
    }

    // 月度事件数据（条形图）
    const monthlyEvents = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const count = eventRecords.filter(r => {
        const reportTime = new Date(r.reportTime);
        return reportTime >= monthStart && reportTime <= monthEnd;
      }).length;
      monthlyEvents.push({
        name: `${date.getMonth() + 1}月`,
        value: count
      });
    }

    // 部门分布数据（饼图）
    const departmentMap = {};
    personnelRecords.forEach(p => {
      const dept = p.department || '未分配';
      departmentMap[dept] = (departmentMap[dept] || 0) + 1;
    });
    const departmentDistribution = Object.entries(departmentMap).map(([name, value]) => ({
      name,
      value
    }));

    // 打卡趋势数据（折线图）
    const attendanceTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      const count = attendanceRecords.filter(r => {
        const checkInTime = new Date(r.checkInTime);
        return checkInTime >= dayStart && checkInTime <= dayEnd;
      }).length;
      attendanceTrend.push({
        name: `${date.getMonth() + 1}/${date.getDate()}`,
        value: count
      });
    }
    setChartData({
      weeklyAttendance,
      monthlyEvents,
      departmentDistribution,
      attendanceTrend
    });
  };

  // 刷新数据
  const handleRefresh = () => {
    setRefreshing(true);
    loadCockpitData();
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  useEffect(() => {
    loadCockpitData();

    // 监听全屏变化
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  return <PageLayout currentPage="data_cockpit" onPageChange={pageId => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {}
    });
  }} title="数据驾驶舱" subtitle="实时监控关键业务指标" user={props.$w?.auth?.currentUser}>
      <div ref={containerRef} className="space-y-6 bg-[#F5F5F7] min-h-screen p-6">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">数据实时同步中</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleFullscreen} className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-xl hover:bg-[#0056CC] transition-all duration-200 shadow-sm hover:shadow-md">
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span className="text-sm font-medium">{isFullscreen ? '退出全屏' : '全屏显示'}</span>
            </button>
            <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span className="text-sm font-medium">刷新数据</span>
            </button>
          </div>
        </div>

        {/* 统计卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 人员总数卡片 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">人员总数</p>
                <p className="text-4xl font-bold text-[#1D1D1F]">
                  {loading ? '-' : stats.personnelCount}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                  <TrendingUp size={12} />
                  <span>在职保安人员</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Users size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* 今日打卡人数卡片 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">今日打卡</p>
                <p className="text-4xl font-bold text-[#1D1D1F]">
                  {loading ? '-' : stats.todayAttendance}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                  <Activity size={12} />
                  <span>人</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                <Clock size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* 今日事件上报卡片 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">今日事件</p>
                <p className="text-4xl font-bold text-[#1D1D1F]">
                  {loading ? '-' : stats.todayEvents}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                  <AlertCircle size={12} />
                  <span>上报数量</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <AlertCircle size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* 当前请假人数卡片 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">当前请假</p>
                <p className="text-4xl font-bold text-[#1D1D1F]">
                  {loading ? '-' : stats.currentLeave}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>人</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Calendar size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 周打卡柱形图 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F]">周打卡统计</h3>
                  <p className="text-xs text-gray-500">近7天打卡人数</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }} />
                <Bar dataKey="value" fill="url(#barGradient)}" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007AFF" />
                    <stop offset="100%" stopColor="#5856D6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 月度事件条形图 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F]">月度事件统计</h3>
                  <p className="text-xs text-gray-500">近12个月事件上报</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.monthlyEvents} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={40} />
                <Tooltip contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }} />
                <Bar dataKey="value" fill="url(#barGradient2)}" radius={[0, 8, 8, 0]} />
                <defs>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FF9500" />
                    <stop offset="100%" stopColor="#FF6B00" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 部门分布饼图 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <PieChart size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F]">部门分布</h3>
                  <p className="text-xs text-gray-500">人员部门占比</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie data={chartData.departmentDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {chartData.departmentDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={['#007AFF', '#5856D6', '#FF9500', '#FF3B30', '#34C759', '#AF52DE'][index % 6]} />)}
                </Pie>
                <Tooltip contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* 打卡趋势折线图 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <LineChart size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F]">打卡趋势</h3>
                  <p className="text-xs text-gray-500">近30天打卡趋势</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsLineChart data={chartData.attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }} />
                <Line type="monotone" dataKey="value" stroke="url(#lineGradient)}" strokeWidth={3} dot={{
                fill: '#34C759',
                strokeWidth: 2,
                r: 4
              }} activeDot={{
                r: 6
              }} />
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34C759" />
                    <stop offset="100%" stopColor="#30D158" />
                  </linearGradient>
                </defs>
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 数据说明区域 */}
        <div className="bg-gradient-to-r from-white via-blue-50/50 to-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4">数据说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">人员总数</p>
                <p className="text-xs text-gray-500 mt-1">统计所有在职保安人员数量</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">今日打卡</p>
                <p className="text-xs text-gray-500 mt-1">统计今日已完成打卡的人员数量</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">今日事件</p>
                <p className="text-xs text-gray-500 mt-1">统计今日上报的事件数量</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
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