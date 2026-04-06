'use client';

import { useState } from 'react';
import { Search, Crown, Star, Zap, Users } from 'lucide-react';
import { useData } from '@/lib/DataProvider';
import { formatCurrency, getGroupColor } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const groupIcons: Record<string, any> = { 'VIP': Crown, 'Cao cấp': Star, 'Tiềm năng': Zap, 'Thường': Users };
const COLORS = ['#f59e0b', '#2563eb', '#8b5cf6', '#6b7280'];

export default function ClassificationPage() {
  const { groups, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');

  const filtered = (groups || []).filter((g: any) => {
    const name = g.name || '';
    const group = g.group_name || g.group || '';
    const matchSearch = searchTerm === '' || name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = selectedGroup === 'all' || group === selectedGroup;
    return matchSearch && matchGroup;
  });

  const uniqueGroups = [...new Set((groups || []).map((g: any) => g.group_name || g.group))];

  const groupStats = uniqueGroups.map(g => {
    const members = (groups || []).filter((gr: any) => (gr.group_name || gr.group) === g);
    return {
      name: g,
      count: members.length,
      totalApe: members.reduce((sum: number, m: any) => sum + (m.total_ape || m.totalApe || 0), 0),
      avgApe: members.length > 0 ? members.reduce((sum: number, m: any) => sum + (m.total_ape || m.totalApe || 0), 0) / members.length : 0,
    };
  });

  const chartData = groupStats.map(g => ({ name: g.name, 'Số KH': g.count }));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {groupStats.map((stat) => {
          const Icon = groupIcons[stat.name] || Users;
          return (
            <div key={stat.name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getGroupColor(stat.name).split(' ')[0]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.count} <span className="text-xs font-normal text-gray-500">KH</span></p>
                </div>
              </div>
              <div className="text-xs text-gray-500">Tổng APE: <span className="font-semibold text-gray-800">{formatCurrency(stat.totalApe)}</span></div>
              <div className="text-xs text-gray-500 mt-1">TB/KH: <span className="font-semibold text-gray-800">{formatCurrency(Math.round(stat.avgApe))}</span></div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm theo tên khách hàng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
          </div>
          <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            <option value="all">Tất cả nhóm</option>
            {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân bố theo nhóm</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip />
              <Bar dataKey="Số KH" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tỷ lệ theo nhóm</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={groupStats} cx="50%" cy="50%" labelLine={false} label={({ name, payload }) => `${name}: ${payload?.count ?? ''}`} outerRadius={80} fill="#8884d8" dataKey="count">
                {groupStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-800">Danh sách khách hàng</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên KH</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Nhóm</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tổng APE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.sort((a: any, b: any) => (b.total_ape || b.totalApe || 0) - (a.total_ape || a.totalApe || 0)).map((customer: any, i: number) => (
                <tr key={customer.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGroupColor(customer.group_name || customer.group)}`}>{customer.group_name || customer.group}</span></td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{formatCurrency(customer.total_ape || customer.totalApe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
