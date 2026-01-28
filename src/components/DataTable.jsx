// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { ChevronLeft, ChevronRight, Search, Plus, Edit, Trash2, Eye, Check, X, MessageCircle, Settings } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

export function DataTable({
  title,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onApprove,
  onReject,
  onProcess,
  onResolve,
  onReply,
  showActions = true,
  showSearch = true,
  showAdd = true,
  showPagination = true,
  pagination,
  onPageChange,
  searchTerm,
  setSearchTerm,
  filterOptions,
  filterValue,
  setFilterValue,
  loading = false
}) {
  return <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
      {/* Header - 右上角定位 */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {showAdd && onAdd && <Button onClick={onAdd} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
              <Plus size={16} className="mr-2" />
              新增
            </Button>}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-6 border-b border-gray-200">
        {(showSearch || filterOptions) && <div className="flex gap-3">
            {showSearch && setSearchTerm && <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input placeholder="搜索..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>}
            {filterOptions && setFilterValue && <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="筛选" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map(option => <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>}
          </div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? <div className="p-12 text-center text-gray-500">
            加载中...
          </div> : <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(column => <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {column.label}
                  </th>)}
                {showActions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    操作
                  </th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? <tr>
                  <td colSpan={columns.length + (showActions ? 1 : 0)} className="px-6 py-12 text-center text-gray-500 whitespace-nowrap">
                    暂无数据
                  </td>
                </tr> : data.map((row, index) => <tr key={index} className="hover:bg-blue-50 even:bg-gray-50">
                    {columns.map(column => <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                      </td>)}
                    {showActions && <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {onView && <Button variant="ghost" size="sm" onClick={() => onView(row)} className="text-blue-600 hover:text-blue-700" title="查看">
                              <Eye size={16} />
                            </Button>}
                          {onEdit && <Button variant="ghost" size="sm" onClick={() => onEdit(row)} className="text-blue-600 hover:text-blue-700" title="编辑">
                              <Edit size={16} />
                            </Button>}
                          {onApprove && <Button variant="ghost" size="sm" onClick={() => onApprove(row)} className="text-green-600 hover:text-green-700" title="通过">
                              <Check size={16} />
                            </Button>}
                          {onReject && <Button variant="ghost" size="sm" onClick={() => onReject(row)} className="text-red-600 hover:text-red-700" title="拒绝">
                              <X size={16} />
                            </Button>}
                          {onProcess && <Button variant="ghost" size="sm" onClick={() => onProcess(row)} className="text-orange-600 hover:text-orange-700" title="处理中">
                              <Settings size={16} />
                            </Button>}
                          {onResolve && <Button variant="ghost" size="sm" onClick={() => onResolve(row)} className="text-green-600 hover:text-green-700" title="已解决">
                              <Check size={16} />
                            </Button>}
                          {onReply && <Button variant="ghost" size="sm" onClick={() => onReply(row)} className="text-purple-600 hover:text-purple-700" title="回复">
                              <MessageCircle size={16} />
                            </Button>}
                          {onDelete && <Button variant="ghost" size="sm" onClick={() => onDelete(row)} className="text-red-600 hover:text-red-700" title="删除">
                              <Trash2 size={16} />
                            </Button>}
                        </div>
                      </td>}
                  </tr>)}
            </tbody>
          </table>}
      </div>

      {/* Pagination */}
      {showPagination && pagination && <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            共 {pagination.total} 条记录，第 {pagination.current} / {pagination.totalPages} 页
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.current - 1)} disabled={pagination.current === 1}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.current + 1)} disabled={pagination.current === pagination.totalPages}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>}
    </div>;
}