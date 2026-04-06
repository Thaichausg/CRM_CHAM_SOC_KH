'use client';

import { useEffect, useState } from 'react';
import {
  FileText, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, Clock, Target, Users, PhoneCall
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { getDashboardStats, getCustomers, getCustomerGroups, getCareTasks, getPipelineItems } from '@/lib/store';
import { formatCurrency, formatNumber, getStatusColor, getGroupColor, getDaysStatus } from '@/lib/utils';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const s = getDashboardStats();
    setStats(s);
    setHasData(s.totalContracts > 0);
  }, []);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Chưa có dữ liệu</h2>
          <p className="text-gray-500 mb-4">Vui lòng import dữ liệu từ file Excel để bắt đầu</p>
          <a
            href="/import"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import dữ liệu
          </a>
        </div>
      </div>
    );
  }

  const customers = getCustomers();
  const groups = getCustomerGroups();
  const tasks = getCareTasks();

  // Status distribution
  const statusData = [
    { name: 'Đang hiệu lực', value: stats.activeContracts, color: '#10b981' },
    { name: 'Mất hiệu lực', value: stats.lapsedContracts, color: '#ef4444' },
  ];

  // Payment cycle distribution
  const cycleMap: Record<string, number> = {};
  customers.forEach(c => {
    cycleMap[c.paymentCycle] = (cycleMap[c.paymentCycle] || 0) + 1;
  });
  const cycleData = Object.entries(cycleMap).map(([name, value]) => ({ name, value }));

  // Group distribution
  const groupMap: Record<string, number> = {};
  groups.forEach(g => {
    groupMap[g.group] = (groupMap[g.group] || 0) + 1;
  });
  const groupData = Object.entries(groupMap).map(([name, value]) => ({ name, value }));

  // Top 10 customers by APE
  const topCustomers = [...groups].sort((a, b) => b.totalApe - a.totalApe).slice(0, 10);

  // Upcoming tasks
  const upcomingTasks = tasks
    .filter(t => t.daysToDue >= 0 && t.daysToDue <= 30)
    .sort((a, b) => a.daysToDue - b.daysToDue)
    .slice(0, 5);

  const statCards = [
    {
      title: 'Tổng hợp đồng',
      value: stats.totalContracts,
      icon: FileText,
      color: 'blue',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-500',
    },
    {
      title: 'Tổng APE',
      value: formatCurrency(stats.totalApe),
      icon: DollarSign,
      color: 'green',
      bg: 'bg-green-50',
      iconBg: 'bg-green-500',
    },
    {
      title: 'Tổng phí định kỳ',
      value: formatCurrency(stats.totalPremium),
      icon: TrendingUp,
      color: 'purple',
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-500',
    },
    {
      title: 'Hợp đồng hiệu lực',
      value: stats.activeContracts,
      icon: Users,
      color: 'emerald',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-500',
    },
    {
      title: 'Mất hiệu lực',
      value: stats.lapsedContracts,
      icon: TrendingDown,
      color: 'red',
      bg: 'bg-red-50',
      iconBg: 'bg-red-500',
    },
    {
      title: 'Sắp đến hạn',
      value: stats.dueSoon,
      icon: Clock,
      color: 'yellow',
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-500',
    },
    {
      title: 'Quá hạn',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'orange',
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-500',
    },
    {
      title: 'KH VIP',
      value: stats.vipCustomers,
      icon: Target,
      color: 'indigo',
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tình trạng hợp đồng</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatNumber(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment cycle */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Định kỳ đóng phí</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cycleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top customers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 khách hàng theo APE</h3>
          <div className="space-y-3">
            {topCustomers.map((customer, i) => (
              <div key={customer.name} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">{customer.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGroupColor(customer.group)}`}>
                  {customer.group}
                </span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(customer.totalApe)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming tasks */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sắp đến hạn (30 ngày)</h3>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Không có khách hàng nào sắp đến hạn</p>
            ) : (
              upcomingTasks.map((task) => {
                const daysInfo = getDaysStatus(task.daysToDue);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <PhoneCall className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{task.customerName}</p>
                      <p className="text-xs text-gray-500">{task.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${daysInfo.color}`}>{task.daysToDue} ngày</p>
                      <p className="text-xs text-gray-500">{formatCurrency(task.premium)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Upload({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}
