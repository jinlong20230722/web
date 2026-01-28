// @ts-ignore;
import React from 'react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { Header } from '@/components/Header';
export function PageLayout({
  children,
  currentPage,
  onPageChange,
  title,
  subtitle,
  user
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // 页面切换处理
  const handlePageChange = pageId => {
    onPageChange?.(pageId);
  };
  return <div className="flex min-h-screen bg-gray-50">
      {/* 左侧菜单栏 */}
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      {/* 右侧内容区 */}
      <main className="flex-1 transition-all duration-300">
        {/* 顶部导航栏 */}
        <Header title={title} subtitle={subtitle} user={user} />

        {/* 页面内容区域 */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>;
}