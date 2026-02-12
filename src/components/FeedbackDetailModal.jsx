// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
// @ts-ignore;
import { Clock, Phone, MessageSquare, FileText } from 'lucide-react';

import { Badge } from '@/components/Badge';
export function FeedbackDetailModal({
  open,
  onOpenChange,
  record
}) {
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
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span>反馈详情</span>
          </DialogTitle>
        </DialogHeader>

        {record && <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>基本信息</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">反馈类型</div>
                  <Badge className={getFeedbackTypeColor(record.feedback_type)}>
                    {record.feedback_type || '-'}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">联系电话</div>
                  <div className="flex items-center space-x-2 text-sm text-gray-900">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{record.phone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 反馈内容 */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>反馈内容</span>
              </h3>
              <div className="bg-white rounded-lg p-4 text-sm text-gray-900 border border-gray-200 min-h-[100px]">
                {record.content || '-'}
              </div>
            </div>

            {/* 时间信息 */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>时间信息</span>
              </h3>
              <div className="text-sm text-gray-900">
                提交时间：{formatTime(record.submit_time)}
              </div>
            </div>
          </div>}
      </DialogContent>
    </Dialog>;
}