// @ts-ignore;
import React, { useEffect, useState } from 'react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
export default function Home(props) {
  const [currentPage, setCurrentPage] = useState('data_cockpit');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 将 $w 注入到 window 对象，以便其他页面可以访问
  useEffect(() => {
    if (props.$w) {
      window.$w = props.$w;
    }
  }, [props.$w]);

  // 页面切换处理
  const handlePageChange = pageId => {
    setCurrentPage(pageId);
    props.$w?.utils?.navigateTo({
      pageId: pageId,
      params: {}
    });
  };
  return <div className="flex min-h-screen bg-gray-50">
      {/* 左侧菜单栏 */}
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      {/* 右侧内容区 */}
      <main className="flex-1 transition-all duration-300">
        {/* 顶部导航栏 */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                天顺保安管理平台
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                v1.0.0 - 企业级管理系统
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* 用户信息 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {props.$w?.auth?.currentUser?.name?.charAt(0) || 'A'}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-700">
                    {props.$w?.auth?.currentUser?.name || '管理员'}
                  </p>
                  <p className="text-gray-500">
                    {props.$w?.auth?.currentUser?.type || '系统管理员'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容区域 */}
        <div className="p-6">
          {props.children}
        </div>
      </main>
    </div>;
}