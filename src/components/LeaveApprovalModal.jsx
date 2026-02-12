// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
// @ts-ignore;
import { Calendar, User, Phone, Building2, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

import { Badge } from '@/components/Badge';
export default function LeaveApprovalModal({
  record,
  open,
  onClose
}) {
  if (!record) return null;
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
  const getStatusColor = status => {
    switch (status) {
      case '待审批':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case '已通过':
        return 'bg-green-100 text-green-800 border-green-300';
      case '已驳回':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  const getStatusIcon = status => {
    switch (status) {
      case '待审批':
        return <Clock className="w-5 h-5" />;
      case '已通过':
        return <CheckCircle className="w-5 h-5" />;
      case '已驳回':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };
  return <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>请假申请详情</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
              <User className="w-4 h-4 mr-2" />
              基本信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">姓名</div>
                  <div className="font-medium text-slate-900">{record.name}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">电话</div>
                  <div className="font-medium text-slate-900">{record.phone}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">所属部门</div>
                  <div className="font-medium text-slate-900">{record.department}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">职务</div>
                  <div className="font-medium text-slate-900">{record.position}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 请假信息 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              请假信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">请假开始时间</div>
                <div className="font-medium text-slate-900">{formatTime(record.start_time)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">请假结束时间</div>
                <div className="font-medium text-slate-900">{formatTime(record.end_time)}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-slate-500 mb-1">请假原因</div>
                <div className="font-medium text-slate-900 bg-white rounded p-3 border border-slate-200">
                  {record.reason}
                </div>
              </div>
            </div>
          </div>

          {/* 审批信息 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              审批信息
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">审批状态</span>
                <Badge className={getStatusColor(record.approval_status)}>
                  <span className="flex items-center space-x-1">
                    {getStatusIcon(record.approval_status)}
                    <span>{record.approval_status}</span>
                  </span>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">提交时间</span>
                <span className="text-sm font-medium text-slate-900">{formatTime(record.submit_time)}</span>
              </div>
              {record.approval_status !== '待审批' && <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">审批人</span>
                    <span className="text-sm font-medium text-slate-900">{record.approver_name || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">审批时间</span>
                    <span className="text-sm font-medium text-slate-900">{formatTime(record.approval_time)}</span>
                  </div>
                  {record.approval_remark && <div>
                      <div className="text-xs text-slate-500 mb-1">审批备注</div>
                      <div className="text-sm font-medium text-slate-900 bg-white rounded p-3 border border-slate-200">
                        {record.approval_remark}
                      </div>
                    </div>}
                </>}
            </div>
          </div>

          {/* 关闭按钮 */}
          <div className="flex justify-end pt-4">
            <button onClick={onClose} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
              关闭
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}