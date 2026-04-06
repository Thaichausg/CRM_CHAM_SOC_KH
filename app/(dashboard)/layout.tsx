'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, PhoneCall,
  TrendingUp, FileText, BarChart3, Upload, Menu, X, LogOut
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'Danh sách KH', href: '/customers', icon: Users, page: 'customers' },
  { label: 'Phân loại KH', href: '/classification', icon: UserCheck, page: 'classification' },
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col flex-shrink-0`}
      >
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-400">CRM</span>
            <span className="text-slate-300 text-sm">Chăm sóc KH</span>
          </h1>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              A
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin</p>
                <p className="text-xs text-slate-400">Quản trị viên</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          )}
          <p className="text-xs text-slate-500 text-center mt-2">
            HTC Integrated CRM v1.0
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800">
              {navItems.find(n => n.href === pathname)?.label || 'Dashboard'}
            </h2>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}