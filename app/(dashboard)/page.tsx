'use client';

import { useData } from '@/lib/DataProvider';
import {
  FileText, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, Clock, Target, Users, PhoneCall
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { formatCurrency, formatNumber, getGroupColor, getDaysStatus } from '@/lib/utils';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const { customers, groups, tasks, stats, loading } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats || stats.totalContracts === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadIcon className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Chưa có dữ liệu</h2>
          <p className="text-gray-500 mb-4">Vui lòng import dữ liệu từ file Excel để bắt đầu</p>
          <a
            href="/import"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UploadIcon className="w-4 h-4" />
            Import dữ liệu
          </a>
        </div>
      </div>
    );
  }

  const statusData = [
    { name: 'Đang hiệu lực', value: stats.activeContracts, color: '#10b981' },
    { name: 'Mất hiệu lực', value: stats.lapsedContracts, color: '#ef4444' },
  ];

  const cycleMap: Record<string, number> = {};
  customers.forEach(c => {
    cycleMap[c.payment_cycle || c.paymentCycle] = (cycleMap[c.payment_cycle || c.paymentCycle] || 0) + 1;
  });
  const cycleData = Object.entries(cycleMap).map(([name, value]) => ({ name, value }));

  const topCustomers = [...groups].sort((a, b) => (b.total_ape || b.totalApe) - (a.total_ape || a.totalApe)).slice(0, 10);

  const upcomingTasks = tasks
    .filter((t: any) => (t.days_to_due ?? t.daysToDue ?? 0) >= 0 && (t.days_to_due ?? t.daysToDue ?? 0) <= 30)
    .sort((a: any, b: any) => (a.days_to_due ?? a.daysToDue) - (b.days_to_due ?? b.daysToDue))
    .slice(0, 5);

  const statCards = [
    { title: 'Tổng hợp đồng', value: stats.totalContracts, icon: FileText, iconBg: 'bg-blue-500' },
    { title: 'Tổng APE', value: formatCurrency(stats.totalApe), icon: DollarSign, iconBg: 'bg-green-500' },
    { title: 'Tổng phí định kỳ', value: formatCurrency(stats.totalPremium), icon: TrendingUp, iconBg: 'bg-purple-500' },
    { title: 'Hợp đồng hiệu lực', value: stats.activeContracts, icon: Users, iconBg: 'bg-emerald-500' },
    { title: 'Mất hiệu lực', value: stats.lapsedContracts, icon: TrendingDown, iconBg: 'bg-red-500' },
    { title: 'Sắp đến hạn', value: stats.dueSoon, icon: Clock, iconBg: 'bg-yellow-500' },
    { title: 'Quá hạn', value: stats.overdue, icon: AlertTriangle, iconBg: 'bg-orange-500' },
    { title: 'KH VIP', value: stats.vipCustomers, icon: Target, iconBg: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tình trạng hợp đồng</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value: any) => formatNumber(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Top 10 khách hàng theo APE</h3>
            <a href="/customers" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Xem tất cả</a>
          </div>
          <div className="space-y-3">
            {topCustomers.map((customer: any, i: number) => (
              <div key={customer.name} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">{customer.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGroupColor(customer.group_name || customer.group)}`}>
                  {customer.group_name || customer.group}
                </span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(customer.total_ape || customer.totalApe)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Sắp đến hạn (30 ngày)</h3>
            <a href="/care" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Xem tất cả</a>
          </div>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Không có khách hàng nào sắp đến hạn</p>
            ) : (
              upcomingTasks.map((task: any) => {
                const days = task.days_to_due ?? task.daysToDue ?? 0;
                const daysInfo = getDaysStatus(days);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <PhoneCall className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{task.customer_name || task.customerName}</p>
                      <p className="text-xs text-gray-500">{task.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${daysInfo.color}`}>{days} ngày</p>
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

function UploadIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}
