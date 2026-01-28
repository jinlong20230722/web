// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Users, Clock, AlertCircle, Calendar, RefreshCw, Info, Maximize, Minimize, Download } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { getRecords } from '@/lib/dataSource';
import { PageLayout } from '@/components/PageLayout';
import { StatisticsChart } from '@/components/StatisticsChart';
import { StatCard } from '@/components/StatCard';
import { ExportUtils, DateRangePicker, filterByDateRange } from '@/components/ExportUtils';
import { ModuleSettings } from '@/components/ModuleSettings';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
export default function DataCockpit(props) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [visibleModules, setVisibleModules] = useState({
    personnelCount: true,
    todayAttendance: true,
    todayEvents: true,
    currentLeave: true,
    departmentChart: true,
    attendanceChart: true,
    eventTypeChart: true,
    eventStatusChart: true,
    leaveTypeChart: true,
    leaveStatusChart: true,
    dataInfo: true
  });
  const [stats, setStats] = useState({
    personnelCount: 0,
    todayAttendance: 0,
    todayEvents: 0,
    currentLeave: 0,
    activePersonnel: 0,
    leavePersonnel: 0,
    normalAttendance: 0,
    abnormalAttendance: 0,
    pendingEvents: 0,
    processingEvents: 0,
    resolvedEvents: 0,
    pendingLeave: 0,
    approvedLeave: 0,
    rejectedLeave: 0
  });
  const [chartData, setChartData] = useState({
    personnelByDepartment: [],
    attendanceByStatus: [],
    eventsByType: [],
    eventsByStatus: [],
    leaveByType: [],
    leaveByStatus: []
  });
  const [allData, setAllData] = useState({
    personnel: [],
    attendance: [],
    events: [],
    leave: []
  });
  const cockpitRef = useRef(null);

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      if (cockpitRef.current?.requestFullscreen) {
        cockpitRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // 切换模块显示
  const toggleModule = moduleId => {
    setVisibleModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // 加载数据驾驶舱数据
  const loadCockpitData = async () => {
    try {
      // 并行加载所有数据
      const [personnelResult, attendanceResult, eventResult, leaveResult] = await Promise.all([getRecords('personnel', {}, 1000, 1, [{
        createdAt: 'desc'
      }]), getRecords('attendance', {}, 1000, 1, [{
        checkInTime: 'desc'
      }]), getRecords('event_report', {}, 1000, 1, [{
        reportTime: 'desc'
      }]), getRecords('leave_request', {}, 1000, 1, [{
        createdAt: 'desc'
      }])]);
      const personnel = personnelResult?.records || [];
      const attendance = attendanceResult?.records || [];
      const events = eventResult?.records || [];
      const leave = leaveResult?.records || [];
      setAllData({
        personnel,
        attendance,
        events,
        leave
      });

      // 根据时间范围筛选数据
      const filteredPersonnel = filterByDateRange(personnel, dateRange, 'createdAt');
      const filteredAttendance = filterByDateRange(attendance, dateRange, 'checkInTime');
      const filteredEvents = filterByDateRange(events, dateRange, 'reportTime');
      const filteredLeave = filterByDateRange(leave, dateRange, 'createdAt');

      // 计算人员总数（在职）
      const personnelCount = filteredPersonnel.filter(p => p.status === '在职' || p.status === 'active').length;
      const activePersonnel = filteredPersonnel.filter(p => p.status === '在职' || p.status === 'active').length;
      const leavePersonnel = filteredPersonnel.filter(p => p.status === '离职' || p.status === 'inactive').length;

      // 计算今日打卡人数
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const todayAttendance = filteredAttendance.filter(record => {
        const checkInTime = new Date(record.checkInTime);
        return checkInTime >= today && checkInTime < tomorrow;
      }).length;
      const normalAttendance = filteredAttendance.filter(r => r.status === '正常' || r.status === 'normal').length;
      const abnormalAttendance = filteredAttendance.filter(r => r.status === '异常' || r.status === 'abnormal').length;

      // 计算今日事件上报数量
      const todayEvents = filteredEvents.filter(record => {
        const reportTime = new Date(record.reportTime);
        return reportTime >= today && reportTime < tomorrow;
      }).length;
      const pendingEvents = filteredEvents.filter(e => e.status === '待处理' || e.status === 'pending').length;
      const processingEvents = filteredEvents.filter(e => e.status === '处理中' || e.status === 'processing').length;
      const resolvedEvents = filteredEvents.filter(e => e.status === '已解决' || e.status === 'resolved').length;

      // 计算当前请假人数（已通过且时间覆盖当前）
      const now = new Date();
      const currentLeave = filteredLeave.filter(record => {
        if (record.approvalStatus !== '已通过' && record.approvalStatus !== 'approved') {
          return false;
        }
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);
        return now >= startTime && now <= endTime;
      }).length;
      const pendingLeave = filteredLeave.filter(l => l.approvalStatus === '待审批' || l.approvalStatus === 'pending').length;
      const approvedLeave = filteredLeave.filter(l => l.approvalStatus === '已通过' || l.approvalStatus === 'approved').length;
      const rejectedLeave = filteredLeave.filter(l => l.approvalStatus === '已拒绝' || l.approvalStatus === 'rejected').length;
      setStats({
        personnelCount,
        todayAttendance,
        todayEvents,
        currentLeave,
        activePersonnel,
        leavePersonnel,
        normalAttendance,
        abnormalAttendance,
        pendingEvents,
        processingEvents,
        resolvedEvents,
        pendingLeave,
        approvedLeave,
        rejectedLeave
      });

      // 生成图表数据
      // 部门分布
      const departmentMap = {};
      filteredPersonnel.forEach(p => {
        const dept = p.department || '未分配';
        departmentMap[dept] = (departmentMap[dept] || 0) + 1;
      });
      const personnelByDepartment = Object.entries(departmentMap).map(([name, value]) => ({
        name,
        value
      }));

      // 打卡状态
      const attendanceByStatus = [{
        name: '正常',
        value: normalAttendance
      }, {
        name: '异常',
        value: abnormalAttendance
      }];

      // 事件类型
      const eventTypeMap = {};
      filteredEvents.forEach(e => {
        const type = e.eventType || '其他';
        eventTypeMap[type] = (eventTypeMap[type] || 0) + 1;
      });
      const eventsByType = Object.entries(eventTypeMap).map(([name, value]) => ({
        name,
        value
      }));

      // 事件状态
      const eventsByStatus = [{
        name: '待处理',
        value: pendingEvents
      }, {
        name: '处理中',
        value: processingEvents
      }, {
        name: '已解决',
        value: resolvedEvents
      }];

      // 请假类型
      const leaveTypeMap = {};
      filteredLeave.forEach(l => {
        const type = l.leaveType || '其他';
        leaveTypeMap[type] = (leaveTypeMap[type] || 0) + 1;
      });
      const leaveByType = Object.entries(leaveTypeMap).map(([name, value]) => ({
        name,
        value
      }));

      // 请假状态
      const leaveByStatus = [{
        name: '待审批',
        value: pendingLeave
      }, {
        name: '已通过',
        value: approvedLeave
      }, {
        name: '已拒绝',
        value: rejectedLeave
      }];
      setChartData({
        personnelByDepartment,
        attendanceByStatus,
        eventsByType,
        eventsByStatus,
        leaveByType,
        leaveByStatus
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

  // 导出数据
  const handleExport = format => {
    const exportData = {
      personnel: allData.personnel,
      attendance: allData.attendance,
      events: allData.events,
      leave: allData.leave,
      stats: stats,
      chartData: chartData,
      exportTime: new Date().toLocaleString('zh-CN')
    };
    if (format === 'csv') {
      // 导出 CSV
      let csvContent = '\uFEFF'; // BOM for UTF-8
      csvContent += '数据驾驶舱导出\n';
      csvContent += `导出时间,${exportData.exportTime}\n\n`;
      csvContent += '统计指标\n';
      csvContent += '指标,数值\n';
      csvContent += `人员总数,${stats.personnelCount}\n`;
      csvContent += `今日打卡,${stats.todayAttendance}\n`;
      csvContent += `今日事件,${stats.todayEvents}\n`;
      csvContent += `当前请假,${stats.currentLeave}\n\n`;
      csvContent += '人员数据\n';
      csvContent += 'ID,姓名,联系电话,所属部门,职位,入职日期,状态\n';
      allData.personnel.forEach(p => {
        csvContent += `${p.id || ''},${p.name || ''},${p.phone || ''},${p.department || ''},${p.position || ''},${p.hireDate || ''},${p.status || ''}\n`;
      });
      csvContent += '\n打卡数据\n';
      csvContent += 'ID,姓名,人员ID,打卡地址,签到时间,状态\n';
      allData.attendance.forEach(a => {
        csvContent += `${a.id || ''},${a.name || ''},${a.personnelId || ''},${a.address || ''},${a.checkInTime || ''},${a.status || ''}\n`;
      });
      csvContent += '\n事件数据\n';
      csvContent += 'ID,事件类型,位置,上报人,上报时间,描述,状态\n';
      allData.events.forEach(e => {
        csvContent += `${e.id || ''},${e.eventType || ''},${e.location || ''},${e.reporter || ''},${e.reportTime || ''},${e.description || ''},${e.status || ''}\n`;
      });
      csvContent += '\n请假数据\n';
      csvContent += 'ID,姓名,人员ID,请假类型,开始时间,结束时间,请假原因,审批状态\n';
      allData.leave.forEach(l => {
        csvContent += `${l.id || ''},${l.name || ''},${l.personnelId || ''},${l.leaveType || ''},${l.startTime || ''},${l.endTime || ''},${l.reason || ''},${l.approvalStatus || ''}\n`;
      });
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `数据驾驶舱_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast({
        title: '导出成功',
        description: 'CSV 文件已下载'
      });
    } else if (format === 'excel') {
      // 导出 Excel (HTML 格式)
      let htmlContent = '<html><head><meta charset="UTF-8"><style>';
      htmlContent += 'table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#4CAF50;color:white;}';
      htmlContent += '</style></head><body>';
      htmlContent += '<h2>数据驾驶舱导出</h2>';
      htmlContent += `<p><strong>导出时间：</strong>${exportData.exportTime}</p>`;
      htmlContent += '<h3>统计指标</h3>';
      htmlContent += '<table><tr><th>指标</th><th>数值</th></tr>';
      htmlContent += `<tr><td>人员总数</td><td>${stats.personnelCount}</td></tr>`;
      htmlContent += `<tr><td>今日打卡</td><td>${stats.todayAttendance}</td></tr>`;
      htmlContent += `<tr><td>今日事件</td><td>${stats.todayEvents}</td></tr>`;
      htmlContent += `<tr><td>当前请假</td><td>${stats.currentLeave}</td></tr>`;
      htmlContent += '</table>';
      htmlContent += '<h3>人员数据</h3>';
      htmlContent += '<table><tr><th>ID</th><th>姓名</th><th>联系电话</th><th>所属部门</th><th>职位</th><th>入职日期</th><th>状态</th></tr>';
      allData.personnel.forEach(p => {
        htmlContent += `<tr><td>${p.id || ''}</td><td>${p.name || ''}</td><td>${p.phone || ''}</td><td>${p.department || ''}</td><td>${p.position || ''}</td><td>${p.hireDate || ''}</td><td>${p.status || ''}</td></tr>`;
      });
      htmlContent += '</table>';
      htmlContent += '<h3>打卡数据</h3>';
      htmlContent += '<table><tr><th>ID</th><th>姓名</th><th>人员ID</th><th>打卡地址</th><th>签到时间</th><th>状态</th></tr>';
      allData.attendance.forEach(a => {
        htmlContent += `<tr><td>${a.id || ''}</td><td>${a.name || ''}</td><td>${a.personnelId || ''}</td><td>${a.address || ''}</td><td>${a.checkInTime || ''}</td><td>${a.status || ''}</td></tr>`;
      });
      htmlContent += '</table>';
      htmlContent += '<h3>事件数据</h3>';
      htmlContent += '<table><tr><th>ID</th><th>事件类型</th><th>位置</th><th>上报人</th><th>上报时间</th><th>描述</th><th>状态</th></tr>';
      allData.events.forEach(e => {
        htmlContent += `<tr><td>${e.id || ''}</td><td>${e.eventType || ''}</td><td>${e.location || ''}</td><td>${e.reporter || ''}</td><td>${e.reportTime || ''}</td><td>${e.description || ''}</td><td>${e.status || ''}</td></tr>`;
      });
      htmlContent += '</table>';
      htmlContent += '<h3>请假数据</h3>';
      htmlContent += '<table><tr><th>ID</th><th>姓名</th><th>人员ID</th><th>请假类型</th><th>开始时间</th><th>结束时间</th><th>请假原因</th><th>审批状态</th></tr>';
      allData.leave.forEach(l => {
        htmlContent += `<tr><td>${l.id || ''}</td><td>${l.name || ''}</td><td>${l.personnelId || ''}</td><td>${l.leaveType || ''}</td><td>${l.startTime || ''}</td><td>${l.endTime || ''}</td><td>${l.reason || ''}</td><td>${l.approvalStatus || ''}</td></tr>`;
      });
      htmlContent += '</table></body></html>';
      const blob = new Blob([htmlContent], {
        type: 'application/vnd.ms-excel'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `数据驾驶舱_${new Date().toISOString().split('T')[0]}.xls`;
      link.click();
      toast({
        title: '导出成功',
        description: 'Excel 文件已下载'
      });
    } else if (format === 'pdf') {
      // 导出 PDF (使用浏览器打印功能)
      const printWindow = window.open('', '_blank');
      printWindow.document.write('<html><head><title>数据驾驶舱</title>');
      printWindow.document.write('<style>');
      printWindow.document.write('body{font-family:Arial,sans-serif;padding:20px;}');
      printWindow.document.write('h1{color:#333;}');
      printWindow.document.write('h2{color:#666;margin-top:30px;}');
      printWindow.document.write('table{border-collapse:collapse;width:100%;margin-top:10px;}');
      printWindow.document.write('th,td{border:1px solid #ddd;padding:8px;text-align:left;}');
      printWindow.document.write('th{background-color:#4CAF50;color:white;}');
      printWindow.document.write('</style></head><body>');
      printWindow.document.write('<h1>数据驾驶舱</h1>');
      printWindow.document.write(`<p><strong>导出时间：</strong>${exportData.exportTime}</p>`);
      printWindow.document.write('<h2>统计指标</h2>');
      printWindow.document.write('<table><tr><th>指标</th><th>数值</th></tr>');
      printWindow.document.write(`<tr><td>人员总数</td><td>${stats.personnelCount}</td></tr>`);
      printWindow.document.write(`<tr><td>今日打卡</td><td>${stats.todayAttendance}</td></tr>`);
      printWindow.document.write(`<tr><td>今日事件</td><td>${stats.todayEvents}</td></tr>`);
      printWindow.document.write(`<tr><td>当前请假</td><td>${stats.currentLeave}</td></tr>`);
      printWindow.document.write('</table>');
      printWindow.document.write('<h2>人员数据</h2>');
      printWindow.document.write('<table><tr><th>ID</th><th>姓名</th><th>联系电话</th><th>所属部门</th><th>职位</th><th>入职日期</th><th>状态</th></tr>');
      allData.personnel.forEach(p => {
        printWindow.document.write(`<tr><td>${p.id || ''}</td><td>${p.name || ''}</td><td>${p.phone || ''}</td><td>${p.department || ''}</td><td>${p.position || ''}</td><td>${p.hireDate || ''}</td><td>${p.status || ''}</td></tr>`);
      });
      printWindow.document.write('</table>');
      printWindow.document.write('<h2>打卡数据</h2>');
      printWindow.document.write('<table><tr><th>ID</th><th>姓名</th><th>人员ID</th><th>打卡地址</th><th>签到时间</th><th>状态</th></tr>');
      allData.attendance.forEach(a => {
        printWindow.document.write(`<tr><td>${a.id || ''}</td><td>${a.name || ''}</td><td>${a.personnelId || ''}</td><td>${a.address || ''}</td><td>${a.checkInTime || ''}</td><td>${a.status || ''}</td></tr>`);
      });
      printWindow.document.write('</table>');
      printWindow.document.write('<h2>事件数据</h2>');
      printWindow.document.write('<table><tr><th>ID</th><th>事件类型</th><th>位置</th><th>上报人</th><th>上报时间</th><th>描述</th><th>状态</th></tr>');
      allData.events.forEach(e => {
        printWindow.document.write(`<tr><td>${e.id || ''}</td><td>${e.eventType || ''}</td><td>${e.location || ''}</td><td>${e.reporter || ''}</td><td>${e.reportTime || ''}</td><td>${e.description || ''}</td><td>${e.status || ''}</td></tr>`);
      });
      printWindow.document.write('</table>');
      printWindow.document.write('<h2>请假数据</h2>');
      printWindow.document.write('<table><tr><th>ID</th><th>姓名</th><th>人员ID</th><th>请假类型</th><th>开始时间</th><th>结束时间</th><th>请假原因</th><th>审批状态</th></tr>');
      allData.leave.forEach(l => {
        printWindow.document.write(`<tr><td>${l.id || ''}</td><td>${l.name || ''}</td><td>${l.personnelId || ''}</td><td>${l.leaveType || ''}</td><td>${l.startTime || ''}</td><td>${l.endTime || ''}</td><td>${l.reason || ''}</td><td>${l.approvalStatus || ''}</td></tr>`);
      });
      printWindow.document.write('</table>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
      toast({
        title: '导出成功',
        description: '请在打印对话框中选择"另存为 PDF"'
      });
    }
  };
  useEffect(() => {
    loadCockpitData();
  }, [dateRange]);

  // 图表颜色
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
  return <PageLayout currentPage="data_cockpit" onPageChange={pageId => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {}
    });
  }} title="数据驾驶舱" subtitle="实时监控关键业务指标" user={props.$w?.auth?.currentUser} onSettingsClick={() => setShowSettings(true)}>
      <div ref={cockpitRef} className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-8 overflow-auto' : ''}`}>
        {/* 顶部操作栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info size={16} />
              <span>数据实时同步中</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleRefresh} disabled={refreshing} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span>刷新数据</span>
            </button>
            <button onClick={toggleFullscreen} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              <span>{isFullscreen ? '退出全屏' : '全屏显示'}</span>
            </button>
            <ExportUtils onExport={handleExport} />
          </div>
        </div>

        {/* 统计卡片网格 */}
        {visibleModules.personnelCount || visibleModules.todayAttendance || visibleModules.todayEvents || visibleModules.currentLeave ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleModules.personnelCount && <StatCard title="人员总数" value={loading ? '-' : stats.personnelCount} icon={Users} color="#3B82F6" />}
            {visibleModules.todayAttendance && <StatCard title="今日打卡" value={loading ? '-' : stats.todayAttendance} icon={Clock} color="#10B981" />}
            {visibleModules.todayEvents && <StatCard title="今日事件" value={loading ? '-' : stats.todayEvents} icon={AlertCircle} color="#F59E0B" />}
            {visibleModules.currentLeave && <StatCard title="当前请假" value={loading ? '-' : stats.currentLeave} icon={Calendar} color="#8B5CF6" />}
          </div> : null}

        {/* 图表区域 */}
        {visibleModules.departmentChart || visibleModules.attendanceChart || visibleModules.eventTypeChart || visibleModules.eventStatusChart || visibleModules.leaveTypeChart || visibleModules.leaveStatusChart ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 部门分布饼图 */}
            {visibleModules.departmentChart && <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">部门分布</h3>
                <div className="h-80">
                  {chartData.personnelByDepartment.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData.personnelByDepartment} cx="50%" cy="50%" labelLine={false} label={entry => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                          {chartData.personnelByDepartment.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-400">暂无数据</div>}
                </div>
              </div>}

            {/* 打卡状态饼图 */}
            {visibleModules.attendanceChart && <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">打卡状态</h3>
                <div className="h-80">
                  {chartData.attendanceByStatus.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData.attendanceByStatus} cx="50%" cy="50%" labelLine={false} label={entry => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                          {chartData.attendanceByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-400">暂无数据</div>}
                </div>
              </div>}

            {/* 事件类型柱状图 */}
            {visibleModules.eventTypeChart && <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">事件类型分布</h3>
                <div className="h-80">
                  {chartData.eventsByType.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.eventsByType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-400">暂无数据</div>}
                </div>
              </div>}

            {/* 事件状态柱状图 */}
            {visibleModules.eventStatusChart && <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">事件处理状态</h3>
                <div className="h-80">
                  {chartData.eventsByStatus.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.eventsByStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-400">暂无数据</div>}
                </div>
              </div>}

            {/* 请假类型柱状图 */}
            {visibleModules.leaveTypeChart && <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">请假类型分布</h3>
                <div className="h-80">
                  {chartData.leaveByType.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.leaveByType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-400">暂无数据</div>}
                </div>
              </div>}

            {/* 请假状态柱状图 */}
            {visibleModules.leaveStatusChart && <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">请假审批状态</h3>
                <div className="h-80">
                  {chartData.leaveByStatus.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.leaveByStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer> : <div className="flex items-center justify-center h-full text-gray-400">暂无数据</div>}
                </div>
              </div>}
          </div> : null}

        {/* 数据说明区域 */}
        {visibleModules.dataInfo && <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 rounded-xl p-6 border border-gray-200">
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
          </div>}

        {/* 模块设置面板 */}
        <ModuleSettings isOpen={showSettings} onClose={() => setShowSettings(false)} modules={visibleModules} onToggle={toggleModule} />
      </div>
    </PageLayout>;
}