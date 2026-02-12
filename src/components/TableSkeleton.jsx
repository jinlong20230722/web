// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';

/**
 * 表格骨架屏组件
 * 用于数据加载时显示骨架屏效果，提升用户体验
 */
export function TableSkeleton({
  columns = 8,
  rows = 5,
  showActions = true
}) {
  return <Table>
      <TableHeader className="bg-gray-50">
        <TableRow>
          {Array.from({
          length: columns
        }).map((_, index) => <TableHead key={index} className="font-semibold whitespace-nowrap">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            </TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({
        length: rows
      }).map((_, rowIndex) => <TableRow key={rowIndex}>
            {Array.from({
          length: columns
        }).map((_, colIndex) => <TableCell key={colIndex}>
                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{
            width: colIndex === columns - 1 ? '60%' : `${Math.random() * 40 + 60}%`,
            animationDelay: `${(rowIndex * columns + colIndex) * 0.1}s`
          }} />
              </TableCell>)}
          </TableRow>)}
      </TableBody>
    </Table>;
}
export default TableSkeleton;