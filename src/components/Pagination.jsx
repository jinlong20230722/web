// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange
}) {
  // 计算显示的页码范围
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // 最多显示5个页码

    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 否则，智能计算显示的页码
      if (currentPage <= 3) {
        // 当前页在前3页
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 当前页在后3页
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };
  const pageNumbers = getPageNumbers();
  return <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm text-gray-500">
        共 {totalRecords} 条记录，共 {totalPages} 页
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="gap-1">
          <ChevronLeft size={16} />
          上一页
        </Button>
        
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => <React.Fragment key={index}>
              {page === '...' ? <span className="px-2 text-gray-400">...</span> : <Button variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => onPageChange(page)} className={currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                  {page}
                </Button>}
            </React.Fragment>)}
        </div>
        
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="gap-1">
          下一页
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>;
}