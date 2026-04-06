'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { getPipelineItems, addPipelineItem, updatePipelineItem, deletePipelineItem } from '@/lib/store';
import { formatCurrency, getStageColor } from '@/lib/utils';
import { PipelineItem } from '@/lib/types';

const stages = ['Tiếp cận', 'Tư vấn', 'Đề xuất', 'Thương lượng', 'Chốt'];

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PipelineItem | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [formData, setFormData] = useState({
    customer: '', stage: 'Tiếp cận', opportunity: '', value: 0,
    probability: 0, nextStep: '', owner: '', notes: ''
  });

  useEffect(() => {
    setItems(getPipelineItems());
  }, []);

  const refresh = () => setItems(getPipelineItems());

  const filtered = items.filter(item =>
    searchTerm === '' ||
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.opportunity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.customer) return;
    if (editingItem) {
      updatePipelineItem(editingItem.id, { ...formData, expectedRevenue: formData.value * formData.probability / 100 });
      setEditingItem(null);
    } else {
      addPipelineItem({
        id: Date.now().toString(),
        ...formData,
        expectedRevenue: formData.value * formData.probability / 100,
      });
    }
    refresh();
    setShowForm(false);
    setFormData({
      customer: '', stage: 'Tiếp cận', opportunity: '', value: 0,
      probability: 0, nextStep: '', owner: '', notes: ''
    });
  };

  const totalValue = items.reduce((s, i) => s + i.value, 0);
  const totalExpected = items.reduce((s, i) => s + i.expectedRevenue, 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Tổng cơ hội</p>
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Tổng giá trị</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Doanh thu dự kiến</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalExpected)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'board' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Danh sách
            </button>
            <button
              onClick={() => { setShowForm(true); setEditingItem(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Thêm
            </button>
          </div>
        </div>
      </div>

      {/* Board view */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stages.map(stage => {
            const stageItems = filtered.filter(i => i.stage === stage);
            const stageValue = stageItems.reduce((s, i) => s + i.value, 0);
            return (
              <div key={stage} className="bg-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(stage)}`}>
                    {stage}
                  </span>
                  <span className="text-xs text-gray-500">{stageItems.length}</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">{formatCurrency(stageValue)}</div>
                <div className="space-y-2">
                  {stageItems.map(item => (
                    <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <h4 className="text-sm font-semibold text-gray-900">{item.customer}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.opportunity}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-600">{formatCurrency(item.value)}</span>
                        <span className="text-xs text-gray-500">{item.probability}%</span>
                      </div>
                      {item.nextStep && (
                        <p className="text-xs text-gray-500 mt-2 italic">{item.nextStep}</p>
                      )}
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => { setEditingItem(item); setShowForm(true); setFormData({
                            customer: item.customer, stage: item.stage, opportunity: item.opportunity,
                            value: item.value, probability: item.probability, nextStep: item.nextStep,
                            owner: item.owner, notes: item.notes
                          }); }}
                          className="p-1 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-3 h-3 text-gray-400" />
                        </button>
                        <button onClick={() => { deletePipelineItem(item.id); refresh(); }} className="p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Giai đoạn</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cơ hội</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Giá trị</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Xác suất</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Dự kiến</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.customer}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(item.stage)}`}>
                      {item.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.opportunity}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.value)}</td>
                  <td className="px-4 py-3 text-sm text-right">{item.probability}%</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{formatCurrency(item.expectedRevenue)}</td>
                  <td className="px-4 py-3 text-center flex gap-1 justify-center">
                    <button
                      onClick={() => { setEditingItem(item); setShowForm(true); setFormData({
                        customer: item.customer, stage: item.stage, opportunity: item.opportunity,
                        value: item.value, probability: item.probability, nextStep: item.nextStep,
                        owner: item.owner, notes: item.notes
                      }); }}
                      className="p-1.5 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => { deletePipelineItem(item.id); refresh(); }} className="p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Chỉnh sửa cơ hội' : 'Thêm cơ hội mới'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={e => setFormData({ ...formData, customer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giai đoạn</label>
                  <select
                    value={formData.stage}
                    onChange={e => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {stages.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác suất (%)</label>
                  <input
                    type="number"
                    value={formData.probability}
                    onChange={e => setFormData({ ...formData, probability: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cơ hội</label>
                <input
                  type="text"
                  value={formData.opportunity}
                  onChange={e => setFormData({ ...formData, opportunity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bước tiếp theo</label>
                <input
                  type="text"
                  value={formData.nextStep}
                  onChange={e => setFormData({ ...formData, nextStep: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người phụ trách</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={e => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                {editingItem ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
