'use client';

import { useState, useMemo } from 'react';
import { Search, Phone, CheckCircle, XCircle, Clock, Plus, Edit2, Trash2, Calendar, Gift, Sparkles, Cake } from 'lucide-react';
import { useData } from '@/lib/DataProvider';
import { formatCurrency, formatDate, getDaysStatus, getUpcomingBirthdays } from '@/lib/utils';

export default function CarePage() {
  const { tasks, profiles, loading, updateTask, deleteTask, addTask } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerName: '', phone: '', dueDate: '', paymentCycle: 'Hàng quý',
    premium: 0, ape: 0, status: 'Đang hiệu lực', task: '', deadline: '', notes: ''
  });

  const upcomingBirthdays = useMemo(() => getUpcomingBirthdays(profiles || [], 30), [profiles]);

  const filtered = (tasks || []).filter((t: any) => {
    const name = t.customer_name || t.customerName || '';
    const phone = t.phone || '';
    const matchSearch = searchTerm === '' || name.toLowerCase().includes(searchTerm.toLowerCase()) || phone.includes(searchTerm);
    const completed = t.completed ?? false;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'completed' && completed) || (statusFilter === 'pending' && !completed);
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a: any, b: any) => (a.days_to_due ?? a.daysToDue ?? 0) - (b.days_to_due ?? b.daysToDue ?? 0));

  const handleSubmit = async () => {
    if (!formData.customerName) return;
    if (editingTask) {
      await updateTask(editingTask.id, formData);
      setEditingTask(null);
    } else {
      await addTask({ ...formData, daysToDue: 0, completed: false });
    }
    setShowForm(false);
    setFormData({ customerName: '', phone: '', dueDate: '', paymentCycle: 'Hàng quý', premium: 0, ape: 0, status: 'Đang hiệu lực', task: '', deadline: '', notes: '' });
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    await updateTask(id, { completed: !completed });
  };

  const stats = {
    total: (tasks || []).length,
    completed: (tasks || []).filter((t: any) => t.completed).length,
    pending: (tasks || []).filter((t: any) => !t.completed).length,
    overdue: (tasks || []).filter((t: any) => (t.days_to_due ?? t.daysToDue ?? 0) < 0 && !t.completed).length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-blue-500" /><div><p className="text-sm text-gray-500">Tổng công việc</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div></div></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><div className="flex items-center gap-3"><CheckCircle className="w-8 h-8 text-green-500" /><div><p className="text-sm text-gray-500">Hoàn thành</p><p className="text-2xl font-bold text-green-600">{stats.completed}</p></div></div></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-yellow-500" /><div><p className="text-sm text-gray-500">Chờ xử lý</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></div></div></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><div className="flex items-center gap-3"><XCircle className="w-8 h-8 text-red-500" /><div><p className="text-sm text-gray-500">Quá hạn</p><p className="text-2xl font-bold text-red-600">{stats.overdue}</p></div></div></div>
      </div>

      {upcomingBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Cake className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white">Sinh nhật sắp tới</h3>
            <span className="ml-auto bg-white/20 text-white text-xs px-2 py-1 rounded-full">{upcomingBirthdays.length} người</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingBirthdays.slice(0, 6).map((p: any) => (
              <div key={p.id} className="bg-white/90 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-600">{p.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-pink-600">{p.daysUntil === 0 ? 'Hôm nay!' : `${p.daysUntil} ngày`}</p>
                    <p className="text-xs text-gray-500">{p.birthdayDate}</p>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-pink-50 rounded text-xs text-pink-700 italic">"{p.message}"</div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>{p.gender}, {p.age} tuổi</span>
                  <span className={`px-2 py-0.5 rounded ${p.rank?.includes('Vàng') ? 'bg-yellow-100 text-yellow-700' : p.rank?.includes('Kim cương') ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{p.rank || 'Thường'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Tìm theo tên, SĐT..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm"><option value="all">Tất cả</option><option value="pending">Chờ xử lý</option><option value="completed">Hoàn thành</option></select>
          <button onClick={() => { setShowForm(true); setEditingTask(null); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="w-4 h-4" />Thêm công việc</button>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((task: any) => {
          const days = task.days_to_due ?? task.daysToDue ?? 0;
          const daysInfo = getDaysStatus(days);
          const completed = task.completed ?? false;
          return (
            <div key={task.id} className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${completed ? 'border-green-200 bg-green-50/50' : days < 0 ? 'border-red-200' : 'border-gray-100 hover:shadow-md'}`}>
              <div className="flex items-start gap-4">
                <button onClick={() => handleToggleComplete(task.id, completed)} className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-blue-500'}`}>
                  {completed && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`font-semibold text-gray-900 ${completed ? 'line-through text-gray-500' : ''}`}>{task.customer_name || task.customerName}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{task.phone}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(task.due_date || task.dueDate)}</span>
                        <span>{task.payment_cycle || task.paymentCycle}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm ${daysInfo.color}`}>{days < 0 ? `Quá hạn ${Math.abs(days)} ngày` : `Còn ${days} ngày`}</p>
                      <p className="text-sm font-semibold text-blue-600">{formatCurrency(task.premium)}</p>
                    </div>
                  </div>
                  {task.task && <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-800"><span className="font-medium">Việc cần làm:</span> {task.task}</div>}
                  {task.notes && <p className="mt-2 text-sm text-gray-500 italic">Ghi chú: {task.notes}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => { setEditingTask(task); setShowForm(true); setFormData({ customerName: task.customer_name || '', phone: task.phone || '', dueDate: task.due_date || '', paymentCycle: task.payment_cycle || 'Hàng quý', premium: task.premium || 0, ape: task.ape || 0, status: task.status || '', task: task.task || '', deadline: task.deadline || '', notes: task.notes || '' }); }} className="p-1.5 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4 text-gray-400 hover:text-blue-600" /></button>
                  <button onClick={() => handleDelete(task.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-bold text-gray-900">{editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}</h3></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label><input type="text" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label><input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Ngày đến hạn</label><input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phí định kỳ</label><input type="number" value={formData.premium} onChange={e => setFormData({ ...formData, premium: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Định kỳ</label><select value={formData.paymentCycle} onChange={e => setFormData({ ...formData, paymentCycle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"><option>Hàng quý</option><option>Nửa năm</option><option>Hàng năm</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Việc cần làm</label><textarea value={formData.task} onChange={e => setFormData({ ...formData, task: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label><textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Hủy</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">{editingTask ? 'Cập nhật' : 'Thêm mới'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}