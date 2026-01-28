// @ts-ignore;
import React, { useEffect, useState } from 'react';

// @ts-ignore;
import { PageLayout } from '@/components/PageLayout';
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
  return <PageLayout currentPage={currentPage} onPageChange={handlePageChange} title="天顺保安管理平台" subtitle="v1.0.0 - 企业级管理系统" user={props.$w?.auth?.currentUser}>
      {props.children}
    </PageLayout>;
}