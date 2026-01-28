// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

/**
 * 导出工具组件
 * 支持 CSV、Excel、PDF 三种导出格式
 */
export function ExportUtils({
  data,
  filename,
  headers,
  onExport })
{
  const {
    toast } =
  useToast();

  /**
   * 导出 CSV 格式
   */
  const exportCSV = () => {
    try {
      const csvContent = [headers.join(','), ...data.map((row) => headers.map((header) => {
        const value = row[header] || '';
        // 处理包含逗号、引号或换行符的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csvContent], {
        type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toLocaleDateString('zh-CN')}.csv`;
      link.click();
      toast({
        title: '导出成功',
        description: '数据已导出为 CSV 文件' });

    } catch (error) {
      toast({
        title: '导出失败',
        description: error.message || 'CSV 导出失败',
        variant: 'destructive' });

    }
  };

  /**
   * 导出 Excel 格式（使用 HTML 表格格式）
   */
  const exportExcel = () => {
    try {
      // 创建 HTML 表格
      let html = '<table border="1">';

      // 表头
      html += '<thead><tr>';
      headers.forEach((header) => {
        html += `<th style="background-color:#4CAF50;color:white;padding:8px;">${header}</th>`;
      });
      html += '</tr></thead>';

      // 表体
      html += '<tbody>';
      data.forEach((row) => {
        html += '<tr>';
        headers.forEach((header) => {
          html += `<td style="padding:8px;">${row[header] || ''}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody>';
      html += '</table>';

      // 创建 Blob
      const blob = new Blob([html], {
        type: 'application/vnd.ms-excel' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toLocaleDateString('zh-CN')}.xls`;
      link.click();
      toast({
        title: '导出成功',
        description: '数据已导出为 Excel 文件' });

    } catch (error) {
      toast({
        title: '导出失败',
        description: error.message || 'Excel 导出失败',
        variant: 'destructive' });

    }
  };

  /**
   * 导出 PDF 格式（使用打印功能）
   */
  const exportPDF = () => {
    try {
      // 创建打印窗口
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: '导出失败',
          description: '无法打开打印窗口，请检查浏览器设置',
          variant: 'destructive' });

        return;
      }

      // 创建打印内容
      let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${filename}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { text-align: center; color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${filename}</h1>
  <p>导出时间: ${new Date().toLocaleString('zh-CN')}</p>
  <table>`;

      // 表头
      html += '<thead><tr>';
      headers.forEach((header) => {
        html += `<th>${header}</th>`;
      });
      html += '</tr></thead>';

      // 表体
      html += '<tbody>';
      data.forEach((row) => {
        html += '<tr>';
        headers.forEach((header) => {
          html += `<td>${row[header] || ''}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody>';
      html += '</table>';
      html += '<div class="footer">共 ' + data.length + ' 条记录</div>';
      html += '</body></html>';
      printWindow.document.write(html);
      printWindow.document.close();

      // 等待内容加载完成后打印
      setTimeout(() => {
        printWindow.print();
      }, 250);
      toast({
        title: '导出成功',
        description: '请在打印对话框中选择“另存为 PDF”' });

    } catch (error) {
      toast({
        title: '导出失败',
        description: error.message || 'PDF 导出失败',
        variant: 'destructive' });

    }
  };
  return <div className="flex gap-2">
      <Button onClick={exportCSV} className="bg-green-600 hover:bg-green-700" size="sm">
        <Download className="mr-2" size={16} />
        CSV
      </Button>
      



      



    </div>;
}

/**
 * 时间范围选择器组件
 */
export function DateRangePicker({
  value,
  onChange,
  label })
{
  return <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">{label || '时间范围'}:</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="all">全部时间</option>
        <option value="today">今天</option>
        <option value="yesterday">昨天</option>
        <option value="week">最近7天</option>
        <option value="month">最近30天</option>
        <option value="quarter">最近90天</option>
        <option value="year">最近一年</option>
      </select>
    </div>;
}

/**
 * 根据时间范围筛选数据
 */
export function filterByDateRange(data, dateRange, dateField) {
  if (dateRange === 'all' || !dateField) return data;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate;
  switch (dateRange) {
    case 'today':
      startDate = today;
      break;
    case 'yesterday':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 'quarter':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 90);
      break;
    case 'year':
      startDate = new Date(today);
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      return data;}

  return data.filter((item) => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= startDate && itemDate <= now;
  });
}