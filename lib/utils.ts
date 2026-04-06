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

export function getBirthdayMessages(age: number, gender: string): string[] {
  const messages: Record<string, string[]> = {
    male: [
      `Chúc bạn ${age} tuổi mạnh mẽ, thành công!`,
      `Happy birthday! Chúc một năm mới thật nhiều may mắn!`,
      `Chúc bạn luôn tràn đầy năng lượng và thành đạt!`,
      `Sinh nhật vui vẻ! Chúc bạn sức khỏe dồi dào!`,
      `Chúc bạn một năm mới đầy thành công và hạnh phúc!`,
    ],
    female: [
      `Chúc bạn ${age} tuổi luôn xinh đẹp, hạnh phúc!`,
      `Happy birthday! Chúc bạn luôn rạng rỡ!`,
      `Sinh nhật vui vẻ! Chúc bạn luôn trẻ đẹp!`,
      `Chúc bạn luôn hạnh phúc và được yêu thương!`,
      `Chúc bạn một năm mới đầy niềm vui và sắc đẹp!`,
    ],
    other: [
      `Chúc bạn sinh nhật vui vẻ!`,
      `Happy birthday! Chúc một năm mới thật nhiều may mắn!`,
      `Chúc bạn luôn mạnh khỏe và hạnh phúc!`,
      `Sinh nhật vui vẻ! Chúc bạn thành công!`,
      `Chúc bạn một năm mới đầy thành công!`,
    ],
  };
  
  const key = gender?.toLowerCase() === 'nam' ? 'male' : gender?.toLowerCase() === 'nữ' ? 'female' : 'other';
  return messages[key];
}

export function getUpcomingBirthdays(profiles: any[], daysAhead: number = 30): any[] {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  return profiles
    .map(p => {
      const birthday = p.birthday;
      if (!birthday) return null;
      
      let birthDate: Date;
      if (birthday instanceof Date) {
        birthDate = birthday;
      } else {
        birthDate = new Date(birthday);
        if (isNaN(birthDate.getTime())) {
          const parts = String(birthday).split(/[\/\-]/);
          if (parts.length === 3) {
            birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
        }
      }
      
      if (isNaN(birthDate.getTime())) return null;
      
      let thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      if (thisYearBirthday < today) {
        thisYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
      }
      
      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil > daysAhead) return null;
      
      const age = currentYear - birthDate.getFullYear();
      
      return {
        ...p,
        birthdayDate: thisYearBirthday.toISOString().split('T')[0],
        daysUntil,
        age,
        message: getBirthdayMessages(age, p.gender)?.[0] || 'Chúc mừng sinh nhật!',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
