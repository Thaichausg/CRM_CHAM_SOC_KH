'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '@/lib/DataProvider';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const { importData, stats } = useData();
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const router = useRouter();

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Chỉ hỗ trợ file Excel (.xlsx, .xls)');
      return;
    }

    setImporting(true);
    setError('');
    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      const parseRows = (sheetName: string): any[][] | null => {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) return null;
        return XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      };

      const parseExcelDate = (val: any): string => {
        if (!val) return '';
        if (val instanceof Date) return val.toISOString().split('T')[0];
        if (typeof val === 'string') return val;
        if (typeof val === 'number') {
          const d = new Date(Math.round((val - 25569) * 86400 * 1000));
          return d.toISOString().split('T')[0];
        }
        return String(val);
      };

      const parseNumber = (val: any): number => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const cleaned = val.replace(/[^\d]/g, '');
          return parseInt(cleaned) || 0;
        }
        return 0;
      };

      const cleanPhone = (val: any): string => {
        if (!val) return '';
        return String(val).replace(/[^\d]/g, '');
      };

      const khRows = parseRows('Danh sách KH');
      const plRows = parseRows('Phân loại KH');
      const csRows = parseRows('Chăm sóc');
      const pl2Rows = parseRows('Pipeline');
      const kbRows = parseRows('Kịch bản');

      const customerData = khRows ? (khRows.slice(1) as any[][]).filter(r => r[0]) : [];
      const groupData = plRows ? (plRows.slice(1) as any[][]).filter(r => r[0]) : [];
      const taskData = csRows ? (csRows.slice(1) as any[][]).filter(r => r[0]) : [];
      const pipelineData = pl2Rows ? (pl2Rows.slice(1) as any[][]).filter(r => r[0]) : [];
      const scriptsData = kbRows ? (kbRows.slice(1) as any[][]).filter(r => r[0]) : [];

      const success = await importData({
        customers: customerData,
        groups: groupData,
        tasks: taskData,
        pipeline: pipelineData,
        scriptsData,
      });

      if (success) {
        setImported(true);
      } else {
        setError('Lỗi khi import dữ liệu');
      }
    } catch (e: any) {
      setError('Lỗi khi đọc file: ' + e.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FileSpreadsheet className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Import dữ liệu Excel</h2>
        </div>
        <p className="text-green-100">
          Tải lên file Excel để import toàn bộ dữ liệu khách hàng, phân loại, chăm sóc, pipeline và kịch bản
        </p>
      </div>

      {!imported && (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
          }`}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          {importing ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">Đang xử lý file...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Kéo thả file Excel vào đây</h3>
              <p className="text-gray-500 mb-4">hoặc</p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                <Upload className="w-4 h-4" />
                Chọn file
                <input type="file" accept=".xlsx,.xls" onChange={handleChange} className="hidden" />
              </label>
              <p className="text-sm text-gray-400 mt-4">Hỗ trợ: .xlsx, .xls</p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {imported && stats && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-semibold">Import thành công!</p>
              <p className="text-green-600 text-sm">File: {fileName}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dữ liệu đã import</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Hợp đồng</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalContracts}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">KH hiệu lực</p>
                <p className="text-2xl font-bold text-green-800">{stats.activeContracts}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Tổng APE</p>
                <p className="text-lg font-bold text-purple-800">{(stats.totalApe / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">Công việc chăm sóc</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.dueSoon + stats.overdue}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setImported(false); setFileName(''); }}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Import file khác
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Xem Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sheet được hỗ trợ</h3>
        <div className="space-y-3">
          {[
            { name: 'Danh sách KH', desc: 'Dữ liệu hợp đồng bảo hiểm khách hàng' },
            { name: 'Phân loại KH', desc: 'Phân nhóm khách hàng theo APE' },
            { name: 'Chăm sóc', desc: 'Danh sách công việc chăm sóc khách hàng' },
            { name: 'Pipeline', desc: 'Quản lý cơ hội kinh doanh' },
            { name: 'Kịch bản', desc: 'Kịch bản chăm sóc khách hàng theo tình huống' },
          ].map(sheet => (
            <div key={sheet.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-800">{sheet.name}</p>
                <p className="text-xs text-gray-500">{sheet.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
