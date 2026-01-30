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
  return <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
      {/* 左侧菜单栏 */}
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      {/* 右侧内容区 */}
      <main>
        {/* 顶部导航栏 */}
        <Header title={title} subtitle={subtitle} user={user} />

        {/* 页面内容区域 */}
        <div className="p-6 overflow-x-auto">
          {children}
        </div>
      </main>
    </div>;
}