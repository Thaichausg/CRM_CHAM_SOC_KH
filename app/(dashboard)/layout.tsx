'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, PhoneCall,
  TrendingUp, FileText, BarChart3, Upload, Menu, X, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'Danh sách HĐ', href: '/customers', icon: Users, page: 'customers' },
  { label: 'Xếp hạng', href: '/classification', icon: UserCheck, page: 'classification' },
  { label: 'Chăm sóc KH', href: '/care', icon: PhoneCall, page: 'care' },
  { label: 'Pipeline', href: '/pipeline', icon: TrendingUp, page: 'pipeline' },
  { label: 'Kịch bản', href: '/scripts', icon: FileText, page: 'scripts' },
  { label: 'Báo cáo', href: '/reports', icon: BarChart3, page: 'reports' },
  { label: 'Import dữ liệu', href: '/import', icon: Upload, page: 'import' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleContentClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full flex flex-col flex-shrink-0
          bg-slate-900 text-white transition-all duration-300
          ${isMobile 
            ? (sidebarOpen ? 'w-64' : 'w-0 overflow-hidden') 
            : (sidebarOpen ? 'w-64' : 'w-16')
          }
          ${isMobile ? 'shadow-2xl' : ''}
        `}
      >
        {/* Toggle button at top of sidebar */}
        <div className="p-3 border-b border-slate-700 flex items-center justify-between">
          {(sidebarOpen || isMobile) && (
            <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <span className="text-blue-400">CRM</span>
              {!isMobile && <span className="text-slate-300 text-sm">Chăm sóc KH</span>}
            </h1>
          )}
          {!isMobile && (
            <button 
              onClick={handleToggleSidebar}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title={sidebarOpen ? 'Ẩn sidebar' : 'Hiện sidebar'}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          )}
          {isMobile && sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-800 rounded">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-2 md:p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(sidebarOpen || isMobile) && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="p-2 md:p-3 border-t border-slate-700">
          {(sidebarOpen || isMobile) && (
            <div className="flex items-center gap-2 p-2">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                A
              </div>
              <span className="text-sm text-white truncate">Admin</span>
            </div>
          )}
          {!isMobile && !sidebarOpen && (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
            </div>
          )}
          {(sidebarOpen || isMobile) && (
            <p className="text-xs text-slate-500 text-center mt-2">
              CRM v1.0
            </p>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div 
        className="flex-1 flex flex-col overflow-hidden"
        onClick={handleContentClick}
      >
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 flex-shrink-0">
          {isMobile && (
            <button
              onClick={handleToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">
              {navItems.find(n => n.href === pathname)?.label || 'Dashboard'}
            </h2>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}