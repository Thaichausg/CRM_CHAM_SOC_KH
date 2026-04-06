export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  } catch {
    return dateStr;
  }
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function getStatusColor(status: string): string {
  if (status?.includes('Đang hiệu lực')) return 'bg-green-100 text-green-800';
  if (status?.includes('Mất hiệu lực')) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

export function getGroupColor(group: string): string {
  switch (group) {
    case 'VIP': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Cao cấp': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Tiềm năng': return 'bg-purple-100 text-purple-800 border-purple-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getStageColor(stage: string): string {
  switch (stage) {
    case 'Tiếp cận': return 'bg-blue-100 text-blue-800';
    case 'Tư vấn': return 'bg-yellow-100 text-yellow-800';
    case 'Đề xuất': return 'bg-purple-100 text-purple-800';
    case 'Thương lượng': return 'bg-orange-100 text-orange-800';
    case 'Chốt': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getDaysStatus(days: number): { label: string; color: string } {
  if (days < 0) return { label: 'Quá hạn', color: 'text-red-600 font-bold' };
  if (days <= 7) return { label: 'Sắp đến hạn', color: 'text-orange-600 font-bold' };
  if (days <= 30) return { label: 'Sắp tới', color: 'text-yellow-600' };
  return { label: 'Còn xa', color: 'text-green-600' };
}
