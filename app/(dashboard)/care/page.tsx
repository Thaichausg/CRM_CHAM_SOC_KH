'use client';

import { useEffect, useState } from 'react';
import { Search, Phone, CheckCircle, XCircle, Clock, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { getCareTasks, updateCareTask, addCareTask, deleteCareTask } from '@/lib/store';
import { formatCurrency, formatDate, getDaysStatus } from '@/lib/utils';
import { CareTask } from '@/lib/types';

export default function CarePage() {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<CareTask | null>(null);
  const [formData, setFormData] = useState({
    customerName: '', phone: '', dueDate: '', paymentCycle: 'Hàng quý',
    premium: 0, ape: 0, status: 'Đang hiệu lực', task: '', deadline: '', notes: ''
  });

  useEffect(() => {
    setTasks(getCareTasks());
  }, []);

  const refresh = () => setTasks(getCareTasks());

  const filtered = tasks.filter(t => {
    const matchSearch = searchTerm === '' ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm);
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'completed' && t.completed) ||
      (statusFilter === 'pending' && !t.completed);
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => a.daysToDue - b.daysToDue);

  const handleSubmit = () => {
    if (!formData.customerName) return;
    if (editingTask) {
      updateCareTask(editingTask.id, { ...formData });
      setEditingTask(null);
    } else {
      addCareTask({
        ...formData,
        id: Date.now().toString(),
        daysToDue: 0,
        completed: false,
      });
    }
    refresh();
    setShowForm(false);
    setFormData({
      customerName: '', phone: '', dueDate: '', paymentCycle: 'Hàng quý',
      premium: 0, ape: 0, status: 'Đang hiệu lực', task: '', deadline: '', notes: ''
    });
  };

  const handleDelete = (id: string) => {
    deleteCareTask(id);
    refresh();
  };

  const handleToggleComplete = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateCareTask(id, { completed: !task.completed });
      refresh();
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => t.daysToDue < 0 && !t.completed).length,
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Tổng công việc</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Quá hạn</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="completed">Hoàn thành</option>
          </select>
          <button
            onClick={() => { setShowForm(true); setEditingTask(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Thêm công việc
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {sorted.map((task) => {
          const daysInfo = getDaysStatus(task.daysToDue);
          return (
            <div
              key={task.id}
              className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
                task.completed ? 'border-green-200 bg-green-50/50' :
                task.daysToDue < 0 ? 'border-red-200' : 'border-gray-100 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`font-semibold text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.customerName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {task.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </span>
                        <span>{task.paymentCycle}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm ${daysInfo.color}`}>
                        {task.daysToDue < 0 ? `Quá hạn ${Math.abs(task.daysToDue)} ngày` : `Còn ${task.daysToDue} ngày`}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">{formatCurrency(task.premium)}</p>
                    </div>
                  </div>

                  {task.task && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-800">
                      <span className="font-medium">Việc cần làm:</span> {task.task}
                    </div>
                  )}

                  {task.notes && (
                    <p className="mt-2 text-sm text-gray-500 italic">Ghi chú: {task.notes}</p>
                  )}
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditingTask(task); setShowForm(true); setFormData({
                      customerName: task.customerName, phone: task.phone, dueDate: task.dueDate,
                      paymentCycle: task.paymentCycle, premium: task.premium, ape: task.ape,
                      status: task.status, task: task.task, deadline: task.deadline, notes: task.notes
                    }); }}
                    className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đến hạn</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phí định kỳ</label>
                  <input
                    type="number"
                    value={formData.premium}
                    onChange={e => setFormData({ ...formData, premium: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Định kỳ</label>
                  <select
                    value={formData.paymentCycle}
                    onChange={e => setFormData({ ...formData, paymentCycle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Hàng quý</option>
                    <option>Nửa năm</option>
                    <option>Hàng năm</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Việc cần làm</label>
                <textarea
                  value={formData.task}
                  onChange={e => setFormData({ ...formData, task: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
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
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {editingTask ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
