// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Download, Upload, TrendingUp, RotateCcw } from 'lucide-react';

export function PersonnelActions({
  onAdd,
  onToggleChart,
  showChart,
  onExportCSV,
  onResetFilters
}) {
  return <div className="flex flex-wrap items-center gap-3 mb-6">
      <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
        + 添加人员
      </Button>
      <div className="w-px h-8 bg-gray-300 mx-2" />
      <Button onClick={onToggleChart} variant="outline" className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        {showChart ? '返回列表' : '统计图表'}
      </Button>
      <Button onClick={onExportCSV} variant="outline" className="flex items-center gap-2">
        <Download className="w-4 h-4" />
        导出 CSV
      </Button>
      <div className="relative">
        <input type="file" accept=".csv" onChange={onExportCSV} className="hidden" id="csv-import" />
        <Button onClick={() => document.getElementById('csv-import').click()} variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          导入 CSV
        </Button>
      </div>
      <div className="w-px h-8 bg-gray-300 mx-2" />
      <Button onClick={onResetFilters} variant="outline" size="sm" className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4" />
        重置筛选
      </Button>
    </div>;
}