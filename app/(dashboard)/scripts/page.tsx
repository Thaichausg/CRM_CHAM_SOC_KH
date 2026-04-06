'use client';

import { useEffect, useState } from 'react';
import { FileText, Copy, Edit2, Plus, Search } from 'lucide-react';
import { getScripts, updateScript } from '@/lib/store';
import { Script } from '@/lib/types';

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setScripts(getScripts());
  }, []);

  const filtered = scripts.filter(s =>
    searchTerm === '' ||
    s.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.goal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (script: Script) => {
    navigator.clipboard.writeText(script.content);
    setCopiedId(script.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = () => {
    if (editingScript) {
      updateScript(editingScript.id, { content: editContent });
      setScripts(getScripts());
      setEditingScript(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Kịch bản chăm sóc khách hàng</h2>
        </div>
        <p className="text-blue-100">
          Bộ kịch bản chuyên nghiệp cho từng tình huống chăm sóc khách hàng
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kịch bản..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Scripts list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((script) => (
          <div key={script.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{script.situation}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {script.goal}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(script)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Sao chép kịch bản"
                  >
                    <Copy className={`w-4 h-4 ${copiedId === script.id ? 'text-green-500' : 'text-gray-400'}`} />
                  </button>
                  <button
                    onClick={() => { setEditingScript(script); setEditContent(script.content); }}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {script.content}
              </div>
              {copiedId === script.id && (
                <p className="mt-2 text-sm text-green-600 font-medium">Đã sao chép!</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editingScript && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingScript(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Chỉnh sửa: {editingScript.situation}
              </h3>
            </div>
            <div className="p-6">
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 whitespace-pre-line"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingScript(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
