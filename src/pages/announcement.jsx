// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast, Pie } from '@/components/ui';
// @ts-ignore;
import { Bell, Trophy, Newspaper, CheckCircle2, BarChart3, PieChart, TrendingUp, FileText, Pin, AlertCircle, Calendar, Download, Upload, RotateCcw } from 'lucide-react';

import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/dataSource';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
export default function Announcement(props) {
  const {
    toast } =
  useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState('type'); // type, priority, trend
  const [formData, setFormData] = useState({
    title: '',
    type: 'notice',
    content: '',
    priority: 'normal',
    icon: 'Bell',
    department: '人事部',
    isPinned: false });

  const iconOptions = [{
    value: 'Bell',
    label: '通知铃铛',
    icon: Bell },
  {
    value: 'Trophy',
    label: '奖杯',
    icon: Trophy },
  {
    value: 'Newspaper',
    label: '报纸',
    icon: Newspaper },
  {
    value: 'CheckCircle2',
    label: '对勾',
    icon: CheckCircle2 }];

  const getIconComponent = (iconName) => {
    const iconMap = {
      Bell,
      Trophy,
      Newspaper,
      CheckCircle2 };

    const IconComponent = iconMap[iconName] || Bell;
    return <IconComponent className="w-5 h-5" />;
  };

  // 加载公告列表
  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const result = await getRecords('announcement', {}, 100, 1, [{
        publishTime: 'desc' }]);

      if (result && result.records) {
        setAnnouncements(result.records);
      }
    } catch (error) {
      console.error('加载公告失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '加载公告列表失败',
        variant: 'destructive' });

    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadAnnouncements();
  }, []);
  const columns = [{
    key: 'index',
    label: '序号',
    render: (value, row, index) => index + 1 },
  {
    key: 'title',
    label: '公告标题',
    render: (value, row) => <div className="flex items-center gap-2">
        {getIconComponent(row.icon)}
        <span>{value}</span>
      </div> },
  {
    key: 'type',
    label: '公告类型',
    render: (value) => {
      const typeMap = {
        notice: '通知',
        training: '培训',
        commendation: '表彰' };

      return typeMap[value] || value;
    } },
  {
    key: 'publishTime',
    label: '发布时间' },
  {
    key: 'department',
    label: '发布部门' },
  {
    key: 'isPinned',
    label: '置顶',
    render: (value) => <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-orange-50 text-orange-800' : 'bg-gray-50 text-gray-600'}`}>
          {value ? '是' : '否'}
        </span> },
  {
    key: 'priority',
    label: '优先级',
    render: (value) => <span className={`px-2 py-1 rounded-full text-xs ${value === 'high' ? 'bg-red-50 text-red-800' : 'bg-blue-100 text-blue-700'}`}>
          {value === 'high' ? '高' : '普通'}
        </span> }];

  const typeOptions = [{
    value: 'all',
    label: '全部类型' },
  {
    value: 'notice',
    label: '通知' },
  {
    value: 'training',
    label: '培训' },
  {
    value: 'commendation',
    label: '表彰' }];

  const priorityOptions = [{
    value: 'all',
    label: '全部优先级' },
  {
    value: 'high',
    label: '高优先级' },
  {
    value: 'normal',
    label: '普通' }];

  const departmentOptions = [{
    value: 'all',
    label: '全部部门' },
  {
    value: '人事部',
    label: '人事部' },
  {
    value: '品质部',
    label: '品质部' },
  {
    value: '品宣部',
    label: '品宣部' },
  {
    value: '运营部',
    label: '运营部' },
  {
    value: '财务部',
    label: '财务部' }];

  const chartTypeOptions = [{
    value: 'type',
    label: '公告类型分布',
    icon: PieChart },
  {
    value: 'priority',
    label: '优先级分布',
    icon: BarChart3 },
  {
    value: 'trend',
    label: '发布趋势',
    icon: TrendingUp }];


  // 统计数据
  const stats = {
    total: announcements.length,
    pinned: announcements.filter((a) => a.isPinned).length,
    today: announcements.filter((a) => {
      const today = new Date().toLocaleDateString('zh-CN');
      return a.publishTime && a.publishTime.includes(today);
    }).length,
    highPriority: announcements.filter((a) => a.priority === 'high').length };


  // 图表数据
  const getChartData = () => {
    if (chartType === 'type') {
      const typeCount = {};
      announcements.forEach((a) => {
        typeCount[a.type] = (typeCount[a.type] || 0) + 1;
      });
      return Object.entries(typeCount).map(([key, value]) => ({
        name: key === 'notice' ? '通知' : key === 'training' ? '培训' : key === 'commendation' ? '表彰' : key,
        value }));

    } else if (chartType === 'priority') {
      const priorityCount = {};
      announcements.forEach((a) => {
        priorityCount[a.priority] = (priorityCount[a.priority] || 0) + 1;
      });
      return Object.entries(priorityCount).map(([key, value]) => ({
        name: key === 'high' ? '高优先级' : '普通',
        value }));

    } else if (chartType === 'trend') {
      const trendData = {};
      announcements.forEach((a) => {
        if (a.publishTime) {
          const date = a.publishTime.split(' ')[0];
          trendData[date] = (trendData[date] || 0) + 1;
        }
      });
      return Object.entries(trendData).sort((a, b) => new Date(a[0]) - new Date(b[0])).slice(-7).map(([date, count]) => ({
        date,
        count }));

    }
    return [];
  };
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const filteredData = announcements.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    const matchesDepartment = filterDepartment === 'all' || item.department === filterDepartment;
    return matchesSearch && matchesType && matchesPriority && matchesDepartment;
  }).sort((a, b) => {
    // 置顶的排在前面
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // 同样置顶状态，按发布时间倒序
    return new Date(b.publishTime) - new Date(a.publishTime);
  });
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterPriority('all');
    setFilterDepartment('all');
  };
  const handleExportCSV = () => {
    const headers = ['序号', '公告标题', '公告类型', '发布时间', '发布部门', '置顶', '优先级', '公告内容'];
    const rows = filteredData.map((item, index) => [index + 1, item.title, item.type === 'notice' ? '通知' : item.type === 'training' ? '培训' : item.type === 'commendation' ? '表彰' : item.type, item.publishTime, item.department, item.isPinned ? '是' : '否', item.priority === 'high' ? '高' : '普通', item.content]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `公告列表_${new Date().toLocaleDateString('zh-CN')}.csv`;
    link.click();
    toast({
      title: '导出成功',
      description: '公告列表已导出为CSV文件' });

  };
  const handleImportCSV = () => {
    toast({
      title: '导入功能',
      description: 'CSV导入功能开发中，敬请期待' });

  };
  const handleAdd = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      type: 'notice',
      content: '',
      priority: 'normal',
      icon: 'Bell',
      department: '人事部',
      isPinned: false });

    setIsDialogOpen(true);
  };
  const handleEdit = (item) => {
    setEditingAnnouncement(item);
    setFormData({
      title: item.title,
      type: item.type,
      content: item.content,
      priority: item.priority,
      icon: item.icon || 'Bell',
      department: item.department || '人事部',
      isPinned: item.isPinned || false });

    setIsDialogOpen(true);
  };
  const handleView = (item) => {
    setSelectedAnnouncement(item);
    setIsViewDialogOpen(true);
  };
  const handleDelete = async (item) => {
    if (confirm('确定要删除该公告吗？')) {
      try {
        const result = await deleteRecord('announcement', {
          $and: [{
            _id: {
              $eq: item._id } }] });



        if (result && result.count > 0) {
          toast({
            title: '删除成功',
            description: '公告已删除' });

          loadAnnouncements();
        } else {
          toast({
            title: '删除失败',
            description: '未找到要删除的公告',
            variant: 'destructive' });

        }
      } catch (error) {
        console.error('删除公告失败:', error);
        toast({
          title: '删除失败',
          description: error.message || '删除公告时发生错误',
          variant: 'destructive' });

      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const publishTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit' });

      if (editingAnnouncement) {
        // 更新公告
        const result = await updateRecord('announcement', {
          title: formData.title,
          type: formData.type,
          content: formData.content,
          priority: formData.priority,
          icon: formData.icon,
          department: formData.department,
          isPinned: formData.isPinned },
        {
          $and: [{
            _id: {
              $eq: editingAnnouncement._id } }] });



        if (result && result.count > 0) {
          toast({
            title: '更新成功',
            description: '公告已更新' });

          loadAnnouncements();
        } else {
          toast({
            title: '更新失败',
            description: '未找到要更新的公告',
            variant: 'destructive' });

        }
      } else {
        // 新增公告
        const result = await createRecord('announcement', {
          title: formData.title,
          type: formData.type,
          content: formData.content,
          priority: formData.priority,
          publishTime: publishTime,
          department: formData.department,
          icon: formData.icon,
          isPinned: formData.isPinned });

        if (result && result.id) {
          toast({
            title: '发布成功',
            description: '公告已发布' });

          loadAnnouncements();
        } else {
          toast({
            title: '发布失败',
            description: '发布公告时发生错误',
            variant: 'destructive' });

        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('提交失败:', error);
      toast({
        title: editingAnnouncement ? '更新失败' : '发布失败',
        description: error.message || '操作时发生错误',
        variant: 'destructive' });

    }
  };
  return <PageLayout currentPage="announcement" onPageChange={(pageId) => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {} });

  }} title="公告信息管理" subtitle="发布和管理公告" user={props.$w?.auth?.currentUser}>
      {/* 统计概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">总公告数</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">所有公告总数</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">置顶公告</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pinned}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Pin className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">置顶公告数量</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">今日发布</p>
              <p className="text-3xl font-bold text-green-600">{stats.today}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">今日发布的公告</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">高优先级</p>
              <p className="text-3xl font-bold text-red-600">{stats.highPriority}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">高优先级公告</p>
        </div>
      </div>

      {/* 操作按钮区域 */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          <FileText className="w-4 h-4 mr-2" />
          发布公告
        </Button>
        <div className="h-6 w-px bg-gray-300 mx-2" />
        <Button variant="outline" onClick={() => setShowChart(!showChart)}>
          <BarChart3 className="w-4 h-4 mr-2" />
          {showChart ? '隐藏图表' : '统计图表'}
        </Button>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          导出CSV
        </Button>
        <Button variant="outline" onClick={handleImportCSV}>
          <Upload className="w-4 h-4 mr-2" />
          导入CSV
        </Button>
        <div className="h-6 w-px bg-gray-300 mx-2" />
        <Button variant="outline" onClick={handleResetFilters}>
          <RotateCcw className="w-4 h-4 mr-2" />
          重置筛选
        </Button>
      </div>

      {/* 图表区域 */}
      {showChart && <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              公告统计分析
            </h3>
            <div className="flex gap-2">
              {chartTypeOptions.map((option) => <button key={option.value} onClick={() => setChartType(option.value)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${chartType === option.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </button>)}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'type' || chartType === 'priority' ? <RechartsPieChart>
                  <Pie data={getChartData()} cx="50%" cy="50%" labelLine={false} label={({
              name,
              percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {getChartData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart> : chartType === 'trend' ? <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                </LineChart> : <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>}
            </ResponsiveContainer>
          </div>
        </div>}

      {/* 筛选区域 */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          筛选条件
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜索关键词</label>
            <Input placeholder="搜索公告标题或内容" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">公告类型</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">发布部门</label>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((option) => <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            公告列表
            <span className="text-sm font-normal text-gray-500 ml-2">
              共 {filteredData.length} 条公告
            </span>
          </h3>
        </div>
        <DataTable columns={columns} data={filteredData} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={typeOptions} filterValue={filterType} setFilterValue={setFilterType} loading={loading} />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? '编辑公告' : '发布公告'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">公告标题 *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({
                ...formData,
                title: e.target.value })}
              required placeholder="请输入公告标题" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">公告类型 *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({
                  ...formData,
                  type: value })}>


                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notice">通知</SelectItem>
                      <SelectItem value="training">培训</SelectItem>
                      <SelectItem value="commendation">表彰</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">公告图标 *</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData({
                  ...formData,
                  icon: value })}>


                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {React.createElement(option.icon, {
                          className: "w-4 h-4" })}

                            <span>{option.label}</span>
                          </div>
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">发布部门 *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({
                ...formData,
                department: value })}>


                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="人事部">人事部</SelectItem>
                      <SelectItem value="品质部">品质部</SelectItem>
                      <SelectItem value="品宣部">品宣部</SelectItem>
                      <SelectItem value="运营部">运营部</SelectItem>
                      <SelectItem value="财务部">财务部</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isPinned" checked={formData.isPinned} onChange={(e) => setFormData({
                ...formData,
                isPinned: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <Label htmlFor="isPinned" className="cursor-pointer">置顶公告</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">公告内容 *</Label>
                <Textarea id="content" value={formData.content} onChange={(e) => setFormData({
                ...formData,
                content: e.target.value })}
              required placeholder="请输入公告内容" rows={6} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingAnnouncement ? '更新' : '发布'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>公告详情</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && <div className="space-y-4">
              <div>
                <Label className="text-gray-600">公告标题</Label>
                <div className="flex items-center gap-2 mt-1">
                  {getIconComponent(selectedAnnouncement.icon)}
                  <p className="font-medium text-lg">{selectedAnnouncement.title}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">公告类型</Label>
                  <p className="font-medium">
                    {selectedAnnouncement.type === 'notice' ? '通知' : selectedAnnouncement.type === 'training' ? '培训' : selectedAnnouncement.type === 'commendation' ? '表彰' : selectedAnnouncement.type}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">优先级</Label>
                  <p className={`font-medium px-2 py-1 rounded-full text-xs inline-block ${selectedAnnouncement.priority === 'high' ? 'bg-red-50 text-red-800' : 'bg-blue-100 text-blue-700'}`}>
                    {selectedAnnouncement.priority === 'high' ? '高' : '普通'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">发布时间</Label>
                  <p className="font-medium">{selectedAnnouncement.publishTime}</p>
                </div>
                <div>
                  <Label className="text-gray-600">发布部门</Label>
                  <p className="font-medium">{selectedAnnouncement.department}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">是否置顶</Label>
                <p className={`font-medium px-2 py-1 rounded-full text-xs inline-block ${selectedAnnouncement.isPinned ? 'bg-orange-50 text-orange-800' : 'bg-gray-50 text-gray-600'}`}>
                  {selectedAnnouncement.isPinned ? '是' : '否'}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">公告内容</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </PageLayout>;
}