'use client';

import { useData } from '@/lib/DataProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, formatNumber, getStatusColor } from '@/lib/utils';
import { Download, TrendingUp, DollarSign, Users, FileText } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function ReportsPage() {
  const { customers, groups, tasks, pipeline, stats, loading } = useData();

  if (loading || !stats || stats.totalContracts === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Chưa có dữ liệu</h2>
          <p className="text-gray-500">Vui lòng import dữ liệu trước khi xem báo cáo</p>
        </div>
      </div>
    );
  }

  const statusMap: Record<string, number> = {};
  (customers || []).forEach((c: any) => { const s = c.status || ''; statusMap[s] = (statusMap[s] || 0) + 1; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  const cycleMap: Record<string, number> = {};
  (customers || []).forEach((c: any) => { const cycle = c.payment_cycle || c.paymentCycle || ''; cycleMap[cycle] = (cycleMap[cycle] || 0) + (c.ape_number || c.apeNumber || 0); });
  const cycleData = Object.entries(cycleMap).map(([name, value]) => ({ name, value }));

  const stageMap: Record<string, number> = {};
  (pipeline || []).forEach((p: any) => { const s = p.stage || ''; stageMap[s] = (stageMap[s] || 0) + (p.value || 0); });
  const pipelineData = Object.entries(stageMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3"><FileText className="w-8 h-8 text-blue-500" /><div><p className="text-sm text-gray-500">Tổng hợp đồng</p><p className="text-2xl font-bold">{stats.totalContracts}</p></div></div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-green-500" /><div><p className="text-sm text-gray-500">Tổng APE</p><p className="text-xl font-bold">{formatCurrency(stats.totalApe)}</p></div></div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3"><Users className="w-8 h-8 text-purple-500" /><div><p className="text-sm text-gray-500">KH hiệu lực</p><p className="text-2xl font-bold">{stats.activeContracts}</p></div></div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3"><TrendingUp className="w-8 h-8 text-orange-500" /><div><p className="text-sm text-gray-500">Tỷ lệ hiệu lực</p><p className="text-2xl font-bold">{stats.totalContracts > 0 ? Math.round(stats.activeContracts / stats.totalContracts * 100) : 0}%</p></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tình trạng hợp đồng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Doanh thu theo định kỳ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cycleData}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {(pipeline || []).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline theo giai đoạn</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-800">Top khách hàng theo APE</h3></div>
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
            {[...groups].sort((a: any, b: any) => (b.total_ape || b.totalApe || 0) - (a.total_ape || a.totalApe || 0)).slice(0, 20).map((g: any, i: number) => (
              <tr key={g.name} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{g.name}</td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${(g.group_name || g.group) === 'VIP' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{g.group_name || g.group}</span></td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{formatCurrency(g.total_ape || g.totalApe)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}