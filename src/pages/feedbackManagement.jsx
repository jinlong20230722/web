// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, Filter, ChevronDown, ChevronUp, Clock, Phone, MessageSquare, FileText } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

import { Badge } from '@/components/Badge';
import { FeedbackDetailModal } from '@/components/FeedbackDetailModal';
export default function FeedbackManagement(props) {
  const {
    toast
  } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'submit_time',
    direction: 'desc'
  });
  const [filters, setFilters] = useState({
    feedbackType: 'all'
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // 反馈类型选项
  const feedbackTypeOptions = ['建议', '投诉', '其他'];

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const whereConditions = [];

      // 反馈类型筛选
      if (filters.feedbackType && filters.feedbackType !== 'all') {
        whereConditions.push({
          feedback_type: {
            $eq: filters.feedbackType
          }
        });
      }
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'feedback',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: whereConditions
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: pagination.pageSize,
          pageNumber: pagination.current,
          orderBy: [{
            [sortConfig.key]: sortConfig.direction === 'asc' ? 'asc' : 'desc'
          }]
        }
      });
      if (result.records) {
        setData(result.records);
        setPagination(prev => ({
          ...prev,
          total: result.totalCount || 0
        }));
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '加载数据失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, [pagination.current, sortConfig, filters.feedbackType]);

  // 排序处理
  const handleSort = key => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 展开/收起行
  const toggleRow = id => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 获取反馈类型颜色
  const getFeedbackTypeColor = type => {
    const colors = {
      '建议': 'bg-blue-100 text-blue-800 border-blue-200',
      '投诉': 'bg-red-100 text-red-800 border-red-200',
      '其他': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 格式化时间
  const formatTime = timestamp => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 截取内容摘要
  const getContentSummary = (content, maxLength = 50) => {
    if (!content) return '-';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({
      feedbackType: 'all'
    });
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部导航栏 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8" />
              <h1 className="text-2xl font-bold">意见反馈管理</h1>
            </div>
            <div className="text-sm opacity-90">
              共 {pagination.total} 条反馈记录
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 筛选区域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">筛选条件</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 反馈类型筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">反馈类型</label>
              <Select value={filters.feedbackType || 'all'} onValueChange={value => setFilters(prev => ({
              ...prev,
              feedbackType: value === 'all' ? '' : value
            }))}>
                <SelectTrigger>
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {feedbackTypeOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 重置按钮 */}
            <div className="flex items-end">
              <Button onClick={handleResetFilters} className="w-full bg-gray-600 hover:bg-gray-700">
                重置筛选
              </Button>
            </div>
          </div>
        </div>

        {/* 数据表格 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">反馈列表</h2>
              </div>
              <div className="text-sm text-gray-500">
                当前第 {pagination.current} 页，共 {Math.ceil(pagination.total / pagination.pageSize)} 页
              </div>
            </div>
          </div>

          {loading ? <div className="p-12 text-center text-gray-500">加载中...</div> : data.length === 0 ? <div className="p-12 text-center text-gray-500">暂无数据</div> : <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('feedback_type')}>
                        <div className="flex items-center space-x-1">
                          <span>反馈类型</span>
                          {sortConfig.key === 'feedback_type' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        反馈内容摘要
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        联系电话
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-blue-100" onClick={() => handleSort('submit_time')}>
                        <div className="flex items-center space-x-1">
                          <span>提交时间</span>
                          {sortConfig.key === 'submit_time' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((record, index) => <React.Fragment key={record._id}>
                        <tr className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-4">
                            <Badge className={getFeedbackTypeColor(record.feedback_type)}>
                              {record.feedback_type || '-'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-md">
                              {getContentSummary(record.content, 60)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-900">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{record.phone || '-'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-900">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{formatTime(record.submit_time)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Button variant="ghost" size="sm" onClick={() => toggleRow(record._id)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              {expandedRows.has(record._id) ? '收起' : '查看详情'}
                            </Button>
                          </td>
                        </tr>
                        {/* 展开行 */}
                        {expandedRows.has(record._id) && <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <td colSpan="5" className="px-6 py-4">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">完整反馈内容：</h4>
                                  <div className="bg-white rounded-lg p-4 text-sm text-gray-900 border border-gray-200">
                                    {record.content || '-'}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>提交时间：{formatTime(record.submit_time)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4" />
                                    <span>联系电话：{record.phone || '-'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>}
                      </React.Fragment>)}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  显示 {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} 条，共 {pagination.total} 条
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({
                ...prev,
                current: prev.current - 1
              }))} disabled={pagination.current === 1}>
                    上一页
                  </Button>
                  <span className="text-sm text-gray-700 px-3">
                    {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize) || 1}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({
                ...prev,
                current: prev.current + 1
              }))} disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}>
                    下一页
                  </Button>
                </div>
              </div>
            </>}
        </div>
      </div>
    </div>;
}