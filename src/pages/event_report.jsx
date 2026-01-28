// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Download, Calendar, Filter, RotateCcw } from 'lucide-react';

import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { getRecords, createRecord, updateRecord, deleteRecord, formatDateTime } from '@/lib/dataSource';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
export default function EventReport(props) {
  const {
    toast } =
  useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [showCharts, setShowCharts] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterEventType, setFilterEventType] = useState('all');
  const [formData, setFormData] = useState({
    eventType: '',
    address: '',
    reporterId: '',
    reporterName: '',
    description: '' });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // 加载事件数据
  const loadEvents = async () => {
    setLoading(true);
    try {
      const result = await getRecords('event_report', {}, 100, 1, [{
        reportTime: 'desc' }]);

      if (result && result.records) {
        setEvents(result.records);
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载事件数据失败',
        variant: 'destructive' });

    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadEvents();
  }, []);
  const columns = [{
    key: '_id',
    label: 'ID' },
  {
    key: 'eventType',
    label: '事件类型' },
  {
    key: 'address',
    label: '位置' },
  {
    key: 'reporterName',
    label: '上报人' },
  {
    key: 'reportTime',
    label: '上报时间',
    render: (value) => formatDateTime(value) },
  {
    key: 'description',
    label: '描述' }];

  const filterOptions = [{
    value: 'all',
    label: '全部状态' },
  {
    value: 'pending',
    label: '待处理' },
  {
    value: 'processing',
    label: '处理中' },
  {
    value: 'resolved',
    label: '已解决' }];

  const eventTypeOptions = [{
    value: 'all',
    label: '全部类型' },
  {
    value: '安全隐患',
    label: '安全隐患' },
  {
    value: '设备故障',
    label: '设备故障' },
  {
    value: '人员违规',
    label: '人员违规' },
  {
    value: '其他',
    label: '其他' }];

  const filteredData = events.filter((item) => {
    const matchesSearch = item.eventType?.toLowerCase().includes(searchTerm.toLowerCase()) || item.address?.toLowerCase().includes(searchTerm.toLowerCase()) || item.reporterName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all';
    const matchesEventType = filterEventType === 'all' || item.eventType === filterEventType;
    const matchesDateRange = (!startDate || !item.reportTime || new Date(item.reportTime) >= new Date(startDate)) && (!endDate || !item.reportTime || new Date(item.reportTime) <= new Date(endDate + 'T23:59:59'));
    return matchesSearch && matchesFilter && matchesEventType && matchesDateRange;
  });
  const handleExportCSV = () => {
    const headers = ['序号', '事件类型', '位置', '上报人', '上报时间', '状态', '描述'];
    const csvContent = ['\uFEFF' + headers.join(','), ...filteredData.map((item, index) => [index + 1, item.eventType || '', item.address || '', item.reporterName || '', formatDateTime(item.reportTime) || '', item.status || '待处理', (item.description || '').replace(/,/g, '，').replace(/\n/g, ' ')].join(','))].join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `事件上报数据_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({
      title: '导出成功',
      description: `已导出 ${filteredData.length} 条数据` });

  };
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterEventType('all');
    setStartDate('');
    setEndDate('');
  };
  const getChartData = () => {
    const statusData = filteredData.reduce((acc, item) => {
      const status = item.status || '待处理';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const statusChartData = Object.entries(statusData).map(([name, value]) => ({
      name,
      value }));

    const typeData = filteredData.reduce((acc, item) => {
      const type = item.eventType || '其他';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const typeChartData = Object.entries(typeData).map(([name, value]) => ({
      name,
      value }));

    const monthlyData = filteredData.reduce((acc, item) => {
      if (item.reportTime) {
        const date = new Date(item.reportTime);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
      }
      return acc;
    }, {});
    const monthlyChartData = Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => ({
      name,
      value }));

    return {
      statusChartData,
      typeChartData,
      monthlyChartData };

  };
  const {
    statusChartData,
    typeChartData,
    monthlyChartData } =
  getChartData();
  const handleAdd = () => {
    setFormData({
      eventType: '',
      address: '',
      reporterId: '',
      reporterName: '',
      description: '' });

    setIsDialogOpen(true);
  };
  const handleView = (item) => {
    setSelectedEvent(item);
    setIsViewDialogOpen(true);
  };
  const handleProcess = async (item) => {
    if (confirm('确定要标记该事件为处理中吗？')) {
      try {
        await updateRecord('event_report', {
          status: '处理中' },
        {
          $and: [{
            _id: {
              $eq: item._id } }] });



        toast({
          title: '更新成功',
          description: '事件状态已更新为处理中' });

        loadEvents();
      } catch (error) {
        toast({
          title: '更新失败',
          description: error.message || '更新事件状态失败',
          variant: 'destructive' });

      }
    }
  };
  const handleResolve = async (item) => {
    if (confirm('确定要标记该事件为已解决吗？')) {
      try {
        await updateRecord('event_report', {
          status: '已解决' },
        {
          $and: [{
            _id: {
              $eq: item._id } }] });



        toast({
          title: '更新成功',
          description: '事件状态已更新为已解决' });

        loadEvents();
      } catch (error) {
        toast({
          title: '更新失败',
          description: error.message || '更新事件状态失败',
          variant: 'destructive' });

      }
    }
  };
  const handleDelete = async (item) => {
    if (confirm('确定要删除该事件记录吗？')) {
      try {
        await deleteRecord('event_report', {
          $and: [{
            _id: {
              $eq: item._id } }] });



        toast({
          title: '删除成功',
          description: '事件记录已删除' });

        loadEvents();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除事件记录失败',
          variant: 'destructive' });

      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        eventType: formData.eventType,
        address: formData.address,
        reporterId: formData.reporterId,
        reporterName: formData.reporterName,
        description: formData.description,
        reportTime: Date.now(),
        attachments: [] };

      await createRecord('event_report', data);
      toast({
        title: '上报成功',
        description: '事件已上报' });

      setIsDialogOpen(false);
      loadEvents();
    } catch (error) {
      toast({
        title: '上报失败',
        description: error.message || '上报事件失败',
        variant: 'destructive' });

    }
  };
  return <PageLayout currentPage="event_report" onPageChange={(pageId) => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {} });

  }} title="事件上报管理" subtitle="查看和处理上报事件" user={props.$w?.auth?.currentUser}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          


          <Button onClick={() => setShowCharts(!showCharts)} variant={showCharts ? "default" : "outline"} className={showCharts ? "bg-green-600 hover:bg-green-700" : ""}>
            <TrendingUp className="w-4 h-4 mr-2" />
            {showCharts ? '返回列表' : '统计图表'}
          </Button>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出 CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-sm text-gray-600 mb-1 block">开始日期</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label className="text-sm text-gray-600 mb-1 block">结束日期</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div className="flex-1 min-w-[180px]">
            <Label className="text-sm text-gray-600 mb-1 block">事件类型</Label>
            <Select value={filterEventType} onValueChange={setFilterEventType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleResetFilters} variant="outline" className="h-10">
            <RotateCcw className="w-4 h-4 mr-2" />
            重置筛选
          </Button>
        </div>
      </div>

      {showCharts ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-base font-semibold mb-3">事件状态分布</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={(entry) => `${entry.name}: ${entry.value}`}>
                  {statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-base font-semibold mb-3">事件类型分布</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{
              fontSize: 12 }} />

                <YAxis tick={{
              fontSize: 12 }} />

                <Tooltip />
                <Bar dataKey="value" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
            <h3 className="text-base font-semibold mb-3">事件上报趋势</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{
              fontSize: 12 }} />

                <YAxis tick={{
              fontSize: 12 }} />

                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> : <DataTable columns={columns} data={filteredData} onView={handleView} onProcess={handleProcess} onResolve={handleResolve} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>上报事件</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reporterName">上报人 *</Label>
                  <Input id="reporterName" value={formData.reporterName} onChange={(e) => setFormData({
                  ...formData,
                  reporterName: e.target.value })}
                required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reporterId">上报人ID *</Label>
                  <Input id="reporterId" value={formData.reporterId} onChange={(e) => setFormData({
                  ...formData,
                  reporterId: e.target.value })}
                required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">事件类型 *</Label>
                <Select value={formData.eventType} onValueChange={(value) => setFormData({
                ...formData,
                eventType: value })}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="安全隐患">安全隐患</SelectItem>
                    <SelectItem value="设备故障">设备故障</SelectItem>
                    <SelectItem value="人员违规">人员违规</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">位置 *</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({
                ...formData,
                address: e.target.value })}
              required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">事件描述 *</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({
                ...formData,
                description: e.target.value })}
              required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                提交上报
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>事件详情</DialogTitle>
          </DialogHeader>
          {selectedEvent && <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">事件类型</Label>
                  <p className="font-medium">{selectedEvent.eventType}</p>
                </div>
                <div>
                  <Label className="text-gray-600">上报人</Label>
                  <p className="font-medium">{selectedEvent.reporterName}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">位置</Label>
                <p className="font-medium">{selectedEvent.address}</p>
              </div>
              <div>
                <Label className="text-gray-600">事件描述</Label>
                <p className="font-medium">{selectedEvent.description}</p>
              </div>
              <div>
                <Label className="text-gray-600">上报时间</Label>
                <p className="font-medium">{formatDateTime(selectedEvent.reportTime)}</p>
              </div>
              {selectedEvent.attachments && selectedEvent.attachments.length > 0 && <div>
                  <Label className="text-gray-600">附件</Label>
                  <div className="flex gap-2 mt-2">
                    {selectedEvent.attachments.map((url, index) => <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        附件{index + 1}
                      </a>)}
                  </div>
                </div>}
            </div>}
        </DialogContent>
      </Dialog>
    </PageLayout>;
}