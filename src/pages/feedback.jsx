// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Download, Upload, Calendar, RotateCcw, MessageSquare, Clock, CheckCircle, Plus, FileText, Filter, BarChart3, PieChart, LineChart as LineChartIcon, Eye } from 'lucide-react';

import { DataTable } from '@/components/DataTable';
import { PageLayout } from '@/components/PageLayout';
import { getRecords, createRecord, updateRecord, deleteRecord, formatDateTime } from '@/lib/dataSource';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default function Feedback(props) {
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCharts, setShowCharts] = useState(false);
  const [chartType, setChartType] = useState('type'); // type, status, monthly
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({
    submitterName: '',
    submitterId: '',
    feedbackType: '建议',
    content: ''
  });

  // 加载反馈数据
  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const result = await getRecords('feedback', {}, 100, 1, [{
        submitTime: 'desc'
      }]);
      if (result && result.records) {
        setFeedbacks(result.records);
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '加载反馈数据失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadFeedbacks();
  }, []);
  const columns = [{
    key: 'index',
    label: '序号',
    render: (value, row, index) => index + 1
  }, {
    key: 'submitterName',
    label: '反馈人'
  }, {
    key: 'submitterId',
    label: '反馈人ID'
  }, {
    key: 'feedbackType',
    label: '反馈类型'
  }, {
    key: 'content',
    label: '反馈内容',
    render: (value, row) => <div className="flex items-center gap-2">
        <span className="max-w-[200px] truncate">{value || ''}</span>
        <Button variant="ghost" size="sm" onClick={() => handleView(row)} className="text-blue-600 hover:text-blue-700 p-1 h-6 w-6" title="查看完整内容">
            <Eye size={14} />
          </Button>
      </div>
  }, {
    key: 'submitTime',
    label: '提交时间',
    render: value => formatDateTime(value)
  }, {
    key: 'processStatus',
    label: '状态',
    render: value => <span className={`px-2 py-1 rounded-full text-xs ${value === '已处理' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {value === '已处理' ? '已处理' : '待处理'}
        </span>
  }];
  const filterOptions = [{
    value: 'all',
    label: '全部状态'
  }, {
    value: 'pending',
    label: '待处理'
  }, {
    value: 'processed',
    label: '已处理'
  }];

  // 计算统计数据
  const getStats = () => {
    const total = feedbacks.length;
    const pending = feedbacks.filter(item => item.processStatus === '待处理').length;
    const processed = feedbacks.filter(item => item.processStatus === '已处理').length;
    const today = new Date().toDateString();
    const todayNew = feedbacks.filter(item => new Date(item.submitTime).toDateString() === today).length;
    return {
      total,
      pending,
      processed,
      todayNew
    };
  };
  const stats = getStats();
  const filteredData = feedbacks.filter(item => {
    const matchesSearch = item.submitterName?.toLowerCase().includes(searchTerm.toLowerCase()) || item.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === 'pending' && item.processStatus === '待处理' || filterStatus === 'processed' && item.processStatus === '已处理';
    const matchesType = filterType === 'all' || item.feedbackType === filterType;
    const matchesDate = (!startDate || !item.submitTime || new Date(item.submitTime) >= new Date(startDate)) && (!endDate || !item.submitTime || new Date(item.submitTime) <= new Date(endDate));
    return matchesSearch && matchesFilter && matchesType && matchesDate;
  });
  const handleAdd = () => {
    setFormData({
      submitterName: '',
      submitterId: '',
      feedbackType: '建议',
      content: ''
    });
    setIsDialogOpen(true);
  };
  const handleReply = item => {
    setSelectedFeedback(item);
    setReplyText('');
    setIsReplyDialogOpen(true);
  };
  const handleView = item => {
    setSelectedFeedback(item);
    setIsViewDialogOpen(true);
  };
  const handleDelete = async item => {
    if (confirm('确定要删除该反馈吗？')) {
      try {
        await deleteRecord('feedback', {
          $and: [{
            _id: {
              $eq: item._id
            }
          }]
        });
        toast({
          title: '删除成功',
          description: '反馈已删除'
        });
        loadFeedbacks();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除反馈失败',
          variant: 'destructive'
        });
      }
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const data = {
        submitterName: formData.submitterName,
        submitterId: formData.submitterId,
        feedbackType: formData.feedbackType,
        content: formData.content,
        processStatus: '待处理'
      };
      await createRecord('feedback', data);
      toast({
        title: '提交成功',
        description: '反馈已提交'
      });
      setIsDialogOpen(false);
      loadFeedbacks();
    } catch (error) {
      toast({
        title: '提交失败',
        description: error.message || '提交反馈失败',
        variant: 'destructive'
      });
    }
  };
  const handleReplySubmit = async e => {
    e.preventDefault();
    try {
      await updateRecord('feedback', {
        processStatus: '已处理'
      }, {
        $and: [{
          _id: {
            $eq: selectedFeedback._id
          }
        }]
      });
      toast({
        title: '回复成功',
        description: '反馈已标记为已处理'
      });
      setIsReplyDialogOpen(false);
      loadFeedbacks();
    } catch (error) {
      toast({
        title: '回复失败',
        description: error.message || '回复失败',
        variant: 'destructive'
      });
    }
  };
  const getChartData = () => {
    const typeData = {};
    const statusData = {};
    const monthlyData = {};
    filteredData.forEach(item => {
      const type = item.feedbackType || '其他';
      const status = item.processStatus || '待处理';
      const date = new Date(item.submitTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      typeData[type] = (typeData[type] || 0) + 1;
      statusData[status] = (statusData[status] || 0) + 1;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    const typeChartData = Object.entries(typeData).map(([name, value]) => ({
      name,
      value
    }));
    const statusChartData = Object.entries(statusData).map(([name, value]) => ({
      name,
      value
    }));
    const monthlyChartData = Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => ({
      name,
      value
    }));
    return {
      typeChartData,
      statusChartData,
      monthlyChartData
    };
  };
  const handleExportCSV = () => {
    const headers = ['序号', '反馈人', '反馈人ID', '反馈类型', '反馈内容', '提交时间', '状态'];
    const rows = filteredData.map((item, index) => [index + 1, item.submitterName || '', item.submitterId || '', item.feedbackType || '', item.content || '', formatDateTime(item.submitTime) || '', item.processStatus || '']);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `反馈数据_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: '导出成功',
      description: `已导出 ${filteredData.length} 条数据`
    });
  };
  const handleImportCSV = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          toast({
            title: '导入失败',
            description: 'CSV 文件为空或格式不正确',
            variant: 'destructive'
          });
          return;
        }
        let successCount = 0;
        let errorCount = 0;
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
            if (values.length >= 4) {
              const data = {
                submitterName: values[1] || '',
                submitterId: values[2] || '',
                feedbackType: values[3] || '建议',
                content: values[4] || '',
                processStatus: '待处理'
              };
              await createRecord('feedback', data);
              successCount++;
            }
          } catch (error) {
            errorCount++;
            console.error('导入第 ' + (i + 1) + ' 行失败:', error);
          }
        }
        toast({
          title: '导入完成',
          description: `成功导入 ${successCount} 条数据，失败 ${errorCount} 条`
        });
        setIsImportDialogOpen(false);
        loadFeedbacks();
      } catch (error) {
        toast({
          title: '导入失败',
          description: error.message || '解析 CSV 文件失败',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
  };
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    setShowCharts(false);
  };
  return <PageLayout currentPage="feedback" onPageChange={pageId => {
    props.$w?.utils?.navigateTo({
      pageId,
      params: {}
    });
  }} title="意见反馈管理" subtitle="查看和回复用户反馈" user={props.$w?.auth?.currentUser}>
      {/* 统计概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">总反馈数</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-2">累计反馈</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">待处理</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-xs text-gray-500 mt-2">需要处理</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">已处理</p>
              <p className="text-3xl font-bold text-green-600">{stats.processed}</p>
              <p className="text-xs text-gray-500 mt-2">已完成</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">今日新增</p>
              <p className="text-3xl font-bold text-purple-600">{stats.todayNew}</p>
              <p className="text-xs text-gray-500 mt-2">今日反馈</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮区域 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowCharts(!showCharts)} className="bg-blue-600 hover:bg-blue-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            {showCharts ? '返回列表' : '统计图表'}
          </Button>
          <div className="w-px h-8 bg-gray-300 mx-2" />
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出 CSV
          </Button>
          <Button onClick={() => setIsImportDialogOpen(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            导入 CSV
          </Button>
        </div>
        <Button onClick={handleResetFilters} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          重置筛选
        </Button>
      </div>

      {!showCharts && <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700">筛选条件</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">开始日期</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full" />
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">结束日期</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full" />
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">反馈类型</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="建议">建议</SelectItem>
                  <SelectItem value="投诉">投诉</SelectItem>
                  <SelectItem value="表扬">表扬</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">处理状态</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="processed">已处理</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>}

      {showCharts ? <div>
          {/* 图表类型切换标签页 */}
          <div className="flex gap-2 mb-6">
            <Button variant={chartType === 'type' ? 'default' : 'outline'} onClick={() => setChartType('type')} className={chartType === 'type' ? 'bg-blue-600 hover:bg-blue-700' : ''}>
              <BarChart3 className="w-4 h-4 mr-2" />
              反馈类型分布
            </Button>
            <Button variant={chartType === 'status' ? 'default' : 'outline'} onClick={() => setChartType('status')} className={chartType === 'status' ? 'bg-blue-600 hover:bg-blue-700' : ''}>
              <PieChart className="w-4 h-4 mr-2" />
              处理状态分布
            </Button>
            <Button variant={chartType === 'monthly' ? 'default' : 'outline'} onClick={() => setChartType('monthly')} className={chartType === 'monthly' ? 'bg-blue-600 hover:bg-blue-700' : ''}>
              <LineChartIcon className="w-4 h-4 mr-2" />
              反馈提交趋势
            </Button>
          </div>

          {/* 图表展示区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartType === 'type' && <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  反馈类型分布
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData().typeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{
                fontSize: 12
              }} />

                    <YAxis tick={{
                fontSize: 12
              }} />

                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>}
            {chartType === 'status' && <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  处理状态分布
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData().statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{
                fontSize: 12
              }} />

                    <YAxis tick={{
                fontSize: 12
              }} />

                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>}
            {chartType === 'monthly' && <div className="bg-white p-6 rounded-lg shadow-lg lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-purple-600" />
                  反馈提交趋势
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getChartData().monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{
                fontSize: 12
              }} />

                    <YAxis tick={{
                fontSize: 12
              }} />

                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>}
          </div>
        </div> : <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">共 <span className="font-semibold text-gray-800">{filteredData.length}</span> 条反馈记录</p>
          </div>
          <DataTable columns={columns} data={filteredData} onView={handleView} onReply={handleReply} onDelete={handleDelete} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterOptions={filterOptions} filterValue={filterStatus} setFilterValue={setFilterStatus} loading={loading} />
        </div>}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>提交反馈</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="submitterName">反馈人 *</Label>
                  <Input id="submitterName" value={formData.submitterName} onChange={e => setFormData({
                  ...formData,
                  submitterName: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submitterId">反馈人ID *</Label>
                  <Input id="submitterId" value={formData.submitterId} onChange={e => setFormData({
                  ...formData,
                  submitterId: e.target.value
                })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedbackType">反馈类型 *</Label>
                <Select value={formData.feedbackType} onValueChange={value => setFormData({
                ...formData,
                feedbackType: value
              })}>


                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="建议">建议</SelectItem>
                    <SelectItem value="投诉">投诉</SelectItem>
                    <SelectItem value="表扬">表扬</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">反馈内容 *</Label>
                <Textarea id="content" value={formData.content} onChange={e => setFormData({
                ...formData,
                content: e.target.value
              })} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                提交反馈
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>查看反馈详情</DialogTitle>
          </DialogHeader>
          {selectedFeedback && <div className="space-y-4">
              <div>
                <Label className="text-gray-600">反馈人</Label>
                <p className="font-medium">{selectedFeedback.submitterName}</p>
              </div>
              <div>
                <Label className="text-gray-600">反馈人ID</Label>
                <p className="font-medium">{selectedFeedback.submitterId}</p>
              </div>
              <div>
                <Label className="text-gray-600">反馈类型</Label>
                <p className="font-medium">{selectedFeedback.feedbackType}</p>
              </div>
              <div>
                <Label className="text-gray-600">反馈内容</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedFeedback.content}</p>
              </div>
              <div>
                <Label className="text-gray-600">提交时间</Label>
                <p className="font-medium">{formatDateTime(selectedFeedback.submitTime)}</p>
              </div>
              <div>
                <Label className="text-gray-600">处理状态</Label>
                <p className="font-medium">{selectedFeedback.processStatus}</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  关闭
                </Button>
              </DialogFooter>
            </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>回复反馈</DialogTitle>
          </DialogHeader>
          {selectedFeedback && <div className="space-y-4">
              <div>
                <Label className="text-gray-600">反馈人</Label>
                <p className="font-medium">{selectedFeedback.submitterName}</p>
              </div>
              <div>
                <Label className="text-gray-600">反馈类型</Label>
                <p className="font-medium">{selectedFeedback.feedbackType}</p>
              </div>
              <div>
                <Label className="text-gray-600">反馈内容</Label>
                <p className="font-medium">{selectedFeedback.content}</p>
              </div>
              <div>
                <Label className="text-gray-600">提交时间</Label>
                <p className="font-medium">{formatDateTime(selectedFeedback.submitTime)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply">回复内容</Label>
                <Textarea id="reply" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="请输入回复内容..." />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                  取消
                </Button>
                <Button type="button" onClick={handleReplySubmit} className="bg-blue-600 hover:bg-blue-700">
                  标记为已处理
                </Button>
              </DialogFooter>
            </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>导入 CSV 文件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">选择 CSV 文件</Label>
              <Input id="csvFile" type="file" accept=".csv" onChange={handleImportCSV} />
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-semibold mb-2">CSV 文件格式要求：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>第一行为表头：序号,反馈人,反馈人ID,反馈类型,反馈内容,提交时间,状态</li>
                <li>反馈类型可选：建议、投诉、表扬、其他</li>
                <li>提交时间和状态字段可选，系统会自动填充</li>
              </ul>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                取消
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>;
}