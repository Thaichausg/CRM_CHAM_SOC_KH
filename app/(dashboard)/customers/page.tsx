'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { getCustomers } from '@/lib/store';
import { formatCurrency, formatNumber, getStatusColor, formatDate } from '@/lib/utils';
import { Customer } from '@/lib/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetail, setShowDetail] = useState<Customer | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const filtered = customers.filter(c => {
    const matchSearch = searchTerm === '' ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.contractNo.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || c.status.includes(statusFilter === 'active' ? 'Đang hiệu lực' : 'Mất hiệu lực');
    const matchCycle = cycleFilter === 'all' || c.paymentCycle === cycleFilter;
    return matchSearch && matchStatus && matchCycle;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, mã hợp đồng..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hiệu lực</option>
            <option value="lapsed">Mất hiệu lực</option>
          </select>
          <select
            value={cycleFilter}
            onChange={e => { setCycleFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả định kỳ</option>
            <option value="Hàng quý">Hàng quý</option>
            <option value="Nửa năm">Nửa năm</option>
            <option value="Hàng năm">Hàng năm</option>
          </select>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Tìm thấy <span className="font-semibold text-gray-800">{filtered.length}</span> khách hàng
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã HĐ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SĐT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tình trạng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Định kỳ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Phí</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">APE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((customer) => (
                <tr key={customer.contractNo} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{customer.contractNo}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-500">{customer.policyHolder}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{customer.product}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.paymentCycle}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(customer.premiumNumber)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">{formatCurrency(customer.apeNumber)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setShowDetail(customer)}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Trang {currentPage} / {totalPages} ({filtered.length} kết quả)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetail(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Chi tiết hợp đồng</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Mã hợp đồng</label>
                  <p className="text-sm font-medium">{showDetail.contractNo}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Sản phẩm</label>
                  <p className="text-sm font-medium">{showDetail.product}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Tình trạng</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(showDetail.status)}`}>
                    {showDetail.status}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Định kỳ</label>
                  <p className="text-sm font-medium">{showDetail.paymentCycle}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Bên mua BH</label>
                  <p className="text-sm font-medium">{showDetail.policyHolder}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Người được BH</label>
                  <p className="text-sm font-medium">{showDetail.insured}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">SĐT</label>
                  <p className="text-sm font-medium">{showDetail.phone}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Tư vấn viên</label>
                  <p className="text-sm font-medium">{showDetail.agent}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Ngày hiệu lực</label>
                  <p className="text-sm font-medium">{formatDate(showDetail.effectiveDate)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Ngày đến hạn</label>
                  <p className="text-sm font-medium">{formatDate(showDetail.dueDate)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Phí định kỳ</label>
                  <p className="text-sm font-semibold text-blue-600">{formatCurrency(showDetail.premiumNumber)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">APE</label>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(showDetail.apeNumber)}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetail(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
