'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { useData } from '@/lib/DataProvider';
import { formatCurrency, getStatusColor, formatDate } from '@/lib/utils';

export default function CustomersPage() {
  const { customers, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [contractCountFilter, setContractCountFilter] = useState('all');
  const [premiumRange, setPremiumRange] = useState<[number, number]>([0, 1000000000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetail, setShowDetail] = useState<any>(null);
  const itemsPerPage = 20;

  const customerStats = useMemo(() => {
    const stats: Record<string, { count: number; totalPremium: number }> = {};
    (customers || []).forEach((c: any) => {
      const name = c.name || c.policy_holder || '';
      if (!stats[name]) stats[name] = { count: 0, totalPremium: 0 };
      stats[name].count++;
      stats[name].totalPremium += c.premium_number ?? c.premiumNumber ?? 0;
    });
    return stats;
  }, [customers]);

  const filtered = (customers || []).filter((c: any) => {
    const name = c.name || '';
    const phone = c.phone || '';
    const contractNo = c.contract_no || c.contractNo || '';
    const matchSearch = searchTerm === '' ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      contractNo.includes(searchTerm);
    const status = c.status || '';
    const matchStatus = statusFilter === 'all' || status.includes(statusFilter === 'active' ? 'Đang hiệu lực' : 'Mất hiệu lực');
    const cycle = c.payment_cycle || c.paymentCycle || '';
    const matchCycle = cycleFilter === 'all' || cycle === cycleFilter;
    
    const matchName = nameFilter === '' || name.toLowerCase().includes(nameFilter.toLowerCase());
    
    const customerKey = c.name || c.policy_holder || '';
    const contractCount = customerStats[customerKey]?.count || 1;
    const matchContractCount = contractCountFilter === 'all' ||
      (contractCountFilter === '1' && contractCount === 1) ||
      (contractCountFilter === '2' && contractCount === 2) ||
      (contractCountFilter === '3' && contractCount === 3) ||
      (contractCountFilter === '4+' && contractCount >= 4);
    
    const premium = c.premium_number ?? c.premiumNumber ?? 0;
    const matchPremium = premium >= premiumRange[0] && premium <= premiumRange[1];

    return matchSearch && matchStatus && matchCycle && matchName && matchContractCount && matchPremium;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilters = () => {
    setNameFilter('');
    setContractCountFilter('all');
    setPremiumRange([0, 1000000000]);
  };

  const hasActiveFilters = nameFilter !== '' || contractCountFilter !== 'all' || premiumRange[0] > 0 || premiumRange[1] < 1000000000;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm theo tên, SĐT, mã hợp đồng..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hiệu lực</option>
            <option value="lapsed">Mất hiệu lực</option>
          </select>
          <select value={cycleFilter} onChange={e => { setCycleFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            <option value="all">Tất cả định kỳ</option>
            <option value="Hàng quý">Hàng quý</option>
            <option value="Nửa năm">Nửa năm</option>
            <option value="Hàng năm">Hàng năm</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters || hasActiveFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <Filter className="w-4 h-4" />
            Bộ lọc
            {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full"></span>}
          </button>
        </div>
        
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">Bộ lọc nâng cao</h4>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                  <X className="w-4 h-4" /> Xóa lọc
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                <input type="text" value={nameFilter} onChange={e => { setNameFilter(e.target.value); setCurrentPage(1); }} placeholder="Nhập tên khách hàng..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số hợp đồng đã mua</label>
                <select value={contractCountFilter} onChange={e => { setContractCountFilter(e.target.value); setCurrentPage(1); }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="all">Tất cả</option>
                  <option value="1">1 hợp đồng</option>
                  <option value="2">2 hợp đồng</option>
                  <option value="3">3 hợp đồng</option>
                  <option value="4+">4+ hợp đồng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng phí (VND)</label>
                <div className="flex gap-2">
                  <input type="number" value={premiumRange[0]} onChange={e => { setPremiumRange([Number(e.target.value), premiumRange[1]]); setCurrentPage(1); }} placeholder="Từ" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="number" value={premiumRange[1]} onChange={e => { setPremiumRange([premiumRange[0], Number(e.target.value)]); setCurrentPage(1); }} placeholder="Đến" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-2 text-sm text-gray-500">
          Tìm thấy <span className="font-semibold text-gray-800">{filtered.length}</span> khách hàng
          {hasActiveFilters && <span className="ml-2 text-blue-600">(đã lọc)</span>}
        </div>
      </div>

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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((customer: any) => {
                const name = customer.name || '';
                const phone = customer.phone || '';
                const contractNo = customer.contract_no || customer.contractNo || '';
                const product = customer.product || '';
                const status = customer.status || '';
                const cycle = customer.payment_cycle || customer.paymentCycle || '';
                const premium = customer.premium_number ?? customer.premiumNumber ?? 0;
                const ape = customer.ape_number ?? customer.apeNumber ?? 0;
                return (
                  <tr key={contractNo} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setShowDetail(customer)}>
                    <td className="px-4 py-3 text-sm font-mono text-blue-600 hover:underline">{contractNo}</td>
                    <td className="px-4 py-3"><div className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline">{name}</div></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{product}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>{status}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{cycle}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(premium)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">{formatCurrency(ape)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">Trang {currentPage} / {totalPages} ({filtered.length} kết quả)</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetail(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Chi tiết hợp đồng</h3>
              <div className="mt-2 flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-xs text-blue-600">Số Hợp đồng</p>
                  <p className="text-xl font-bold text-blue-800">{showDetail.contract_no || showDetail.contractNo}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-600">Họ tên khách hàng</p>
                  <p className="text-xl font-bold text-blue-800">{showDetail.name || showDetail.policy_holder}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500">Sản phẩm</label><p className="text-sm font-medium">{showDetail.product}</p></div>
                <div><label className="text-xs text-gray-500">Tình trạng</label><span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(showDetail.status)}`}>{showDetail.status}</span></div>
                <div><label className="text-xs text-gray-500">Định kỳ</label><p className="text-sm font-medium">{showDetail.payment_cycle || showDetail.paymentCycle}</p></div>
                <div><label className="text-xs text-gray-500">SĐT</label><p className="text-sm font-medium">{showDetail.phone}</p></div>
                <div><label className="text-xs text-gray-500">Tư vấn viên</label><p className="text-sm font-medium">{showDetail.agent}</p></div>
                <div><label className="text-xs text-gray-500">Bên mua BH</label><p className="text-sm font-medium">{showDetail.policy_holder}</p></div>
                <div><label className="text-xs text-gray-500">Ngày hiệu lực</label><p className="text-sm font-medium">{formatDate(showDetail.effective_date || showDetail.effectiveDate)}</p></div>
                <div><label className="text-xs text-gray-500">Ngày đến hạn</label><p className="text-sm font-medium">{formatDate(showDetail.due_date || showDetail.dueDate)}</p></div>
                <div><label className="text-xs text-gray-500">Phí định kỳ</label><p className="text-sm font-semibold text-blue-600">{formatCurrency(showDetail.premium_number ?? showDetail.premiumNumber ?? 0)}</p></div>
                <div><label className="text-xs text-gray-500">APE</label><p className="text-sm font-semibold text-green-600">{formatCurrency(showDetail.ape_number ?? showDetail.apeNumber ?? 0)}</p></div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end"><button onClick={() => setShowDetail(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">Đóng</button></div>
          </div>
        </div>
      )}
    </div>
  );
}