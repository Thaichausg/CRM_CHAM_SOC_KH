'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { getCustomers, getCustomerGroups, getCareTasks, getDashboardStats, getPipelineItems } from '@/lib/store';
import { formatCurrency, formatNumber, getStatusColor } from '@/lib/utils';
import { Download, TrendingUp, DollarSign, Users, FileText } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function ReportsPage() {
  const [hasData, setHasData] = useState(false);
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    setHasData(getDashboardStats().totalContracts > 0);
  }, []);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Chưa có dữ liệu</h2>
          <p className="text-gray-500">Vui lòng import dữ liệu trước khi xem báo cáo</p>
          <a href="/import" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Import dữ liệu
          </a>
        </div>
      </div>
    );
  }

  const customers = getCustomers();
  const groups = getCustomerGroups();
  const tasks = getCareTasks();
  const stats = getDashboardStats();
  const pipeline = getPipelineItems();

  // Revenue by product
  const productMap: Record<string, number> = {};
  customers.forEach(c => {
    productMap[c.product] = (productMap[c.product] || 0) + c.apeNumber;
  });
  const productData = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name: name.substring(0, 20), value }));

  // Revenue by payment cycle
  const cycleMap: Record<string, number> = {};
  customers.forEach(c => {
    cycleMap[c.paymentCycle] = (cycleMap[c.paymentCycle] || 0) + c.apeNumber;
  });
  const cycleData = Object.entries(cycleMap).map(([name, value]) => ({ name, value }));

  // Status breakdown
  const statusMap: Record<string, number> = {};
  customers.forEach(c => {
    statusMap[c.status] = (statusMap[c.status] || 0) + 1;
  });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Agent performance
  const agentMap: Record<string, { count: number; ape: number }> = {};
  customers.forEach(c => {
    if (!agentMap[c.agent]) agentMap[c.agent] = { count: 0, ape: 0 };
    agentMap[c.agent].count++;
    agentMap[c.agent].ape += c.apeNumber;
  });
  const agentData = Object.entries(agentMap)
    .sort((a, b) => b[1].ape - a[1].ape)
    .slice(0, 10)
    .map(([name, data]) => ({ name: name.split('\n')[0], ...data }));

  // Overdue analysis
  const overdueTasks = tasks.filter(t => t.daysToDue < 0);
  const overdueByDays: Record<string, number> = {};
  overdueTasks.forEach(t => {
    const range = t.daysToDue < -365 ? '> 1 năm' : t.daysToDue < -180 ? '6-12 tháng' : t.daysToDue < -90 ? '3-6 tháng' : t.daysToDue < -30 ? '1-3 tháng' : '< 1 tháng';
    overdueByDays[range] = (overdueByDays[range] || 0) + 1;
  });
  const overdueData = Object.entries(overdueByDays).map(([name, value]) => ({ name, value }));

  // Pipeline by stage
  const stageMap: Record<string, number> = {};
  pipeline.forEach(p => {
    stageMap[p.stage] = (stageMap[p.stage] || 0) + p.value;
  });
  const pipelineData = Object.entries(stageMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Report type selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Tổng quan' },
            { id: 'revenue', label: 'Doanh thu' },
            { id: 'customer', label: 'Khách hàng' },
            { id: 'care', label: 'Chăm sóc' },
            { id: 'pipeline', label: 'Pipeline' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportType === type.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {reportType === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Tổng hợp đồng</p>
                  <p className="text-2xl font-bold">{stats.totalContracts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Tổng APE</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalApe)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">KH hiệu lực</p>
                  <p className="text-2xl font-bold">{stats.activeContracts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Tỷ lệ hiệu lực</p>
                  <p className="text-2xl font-bold">{stats.totalContracts > 0 ? Math.round(stats.activeContracts / stats.totalContracts * 100) : 0}%</p>
                </div>
              </div>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Revenue */}
      {reportType === 'revenue' && (
        <>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 sản phẩm theo APE</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 tư vấn viên theo APE</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={agentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value: any, name: any) => name === 'ape' ? formatCurrency(value) : `${value} HĐ`} />
                <Bar dataKey="ape" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Customer */}
      {reportType === 'customer' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">Tổng khách hàng</p>
              <p className="text-3xl font-bold text-gray-900">{groups.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">KH VIP</p>
              <p className="text-3xl font-bold text-yellow-600">{groups.filter(g => g.group === 'VIP').length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">APE trung bình</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(groups.length > 0 ? Math.round(groups.reduce((s, g) => s + g.totalApe, 0) / groups.length) : 0)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Phân loại khách hàng</h3>
            </div>
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
                {[...groups].sort((a, b) => b.totalApe - a.totalApe).map((g, i) => (
                  <tr key={g.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{g.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${g.group === 'VIP' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {g.group}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{formatCurrency(g.totalApe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Care */}
      {reportType === 'care' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">Tổng công việc</p>
              <p className="text-3xl font-bold">{tasks.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">Hoàn thành</p>
              <p className="text-3xl font-bold text-green-600">{tasks.filter(t => t.completed).length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">Chờ xử lý</p>
              <p className="text-3xl font-bold text-yellow-600">{tasks.filter(t => !t.completed).length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">Quá hạn</p>
              <p className="text-3xl font-bold text-red-600">{tasks.filter(t => t.daysToDue < 0).length}</p>
            </div>
          </div>

          {overdueData.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân tích quá hạn</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overdueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Pipeline */}
      {reportType === 'pipeline' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">Tổng cơ hội</p>
              <p className="text-3xl font-bold">{pipeline.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">Tổng giá trị</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.pipelineValue)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">Doanh thu dự kiến</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(stats.expectedRevenue)}</p>
            </div>
          </div>

          {pipelineData.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline theo giai đoạn</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
