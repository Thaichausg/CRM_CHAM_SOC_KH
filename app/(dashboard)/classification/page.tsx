'use client';

import { useEffect, useState } from 'react';
import { Search, Crown, Star, Zap, Users } from 'lucide-react';
import { getCustomerGroups, getCustomers } from '@/lib/store';
import { formatCurrency, formatNumber, getGroupColor } from '@/lib/utils';
import { CustomerGroup } from '@/lib/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const groupIcons: Record<string, any> = {
  'VIP': Crown,
  'Cao cấp': Star,
  'Tiềm năng': Zap,
  'Thường': Users,
};

const COLORS = ['#f59e0b', '#2563eb', '#8b5cf6', '#6b7280'];

export default function ClassificationPage() {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');

  useEffect(() => {
    setGroups(getCustomerGroups());
  }, []);

  const filtered = groups.filter(g => {
    const matchSearch = searchTerm === '' || g.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = selectedGroup === 'all' || g.group === selectedGroup;
    return matchSearch && matchGroup;
  });

  const uniqueGroups = [...new Set(groups.map(g => g.group))];

  const groupStats = uniqueGroups.map(g => {
    const members = groups.filter(gr => gr.group === g);
    return {
      name: g,
      count: members.length,
      totalApe: members.reduce((sum, m) => sum + m.totalApe, 0),
      avgApe: members.reduce((sum, m) => sum + m.totalApe, 0) / members.length,
    };
  });

  const chartData = groupStats.map(g => ({
    name: g.name,
    'Số KH': g.count,
    'Tổng APE': g.totalApe / 1000000,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary cards */}
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
              <div className="text-xs text-gray-500">
                Tổng APE: <span className="font-semibold text-gray-800">{formatCurrency(stat.totalApe)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                TB/KH: <span className="font-semibold text-gray-800">{formatCurrency(Math.round(stat.avgApe))}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên khách hàng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả nhóm</option>
            {uniqueGroups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân bố theo nhóm</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any, name: any) =>
                name === 'Tổng APE' ? formatCurrency(value * 1000000) : `${value} KH`
              } />
              <Bar dataKey="Số KH" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tỷ lệ theo nhóm</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={groupStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, payload }) => `${name}: ${payload?.count ?? ''}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {groupStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Danh sách khách hàng</h3>
        </div>
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
              {filtered.sort((a, b) => b.totalApe - a.totalApe).map((customer, i) => (
                <tr key={customer.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGroupColor(customer.group)}`}>
                      {customer.group}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{formatCurrency(customer.totalApe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
