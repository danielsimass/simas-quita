import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FinancingProvider } from '../../contexts/financing-context';
import { BottomNav } from './bottom-nav';
import { Sidebar } from './sidebar';
import { FinancingSelector } from '../financing/financing-selector';

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <FinancingProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
        />
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
            <FinancingSelector />
          </header>
          <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
            <Outlet />
          </main>
          <BottomNav />
        </div>
      </div>
    </FinancingProvider>
  );
}
