'use client';

import { useState, useEffect } from 'react';
import { FileText, Copy, Edit2, Search } from 'lucide-react';
import { useData } from '@/lib/DataProvider';

export default function ScriptsPage() {
  const { scripts, loading, updateScript, refresh } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingScript, setEditingScript] = useState<any>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = (scripts || []).filter((s: any) =>
    searchTerm === '' ||
    (s.situation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.goal || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async () => {
    if (editingScript) {
      await updateScript(editingScript.id, { content: editContent });
      await refresh();
      setEditingScript(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Kịch bản chăm sóc khách hàng</h2>
        </div>
        <p className="text-blue-100">Bộ kịch bản chuyên nghiệp cho từng tình huống chăm sóc khách hàng</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Tìm kịch bản..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((script: any) => (
          <div key={script.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{script.situation}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{script.goal}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(script.content, script.id)} className="p-2 hover:bg-blue-50 rounded-lg" title="Sao chép">
                    <Copy className={`w-4 h-4 ${copiedId === script.id ? 'text-green-500' : 'text-gray-400'}`} />
                  </button>
                  <button onClick={() => { setEditingScript(script); setEditContent(script.content); }} className="p-2 hover:bg-blue-50 rounded-lg">
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">{script.content}</div>
              {copiedId === script.id && <p className="mt-2 text-sm text-green-600 font-medium">Đã sao chép!</p>}
            </div>
          </div>
        ))}
      </div>

      {editingScript && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingScript(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-bold">Chỉnh sửa: {editingScript.situation}</h3></div>
            <div className="p-6"><textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={12} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm whitespace-pre-line" /></div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button onClick={() => setEditingScript(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Hủy</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}