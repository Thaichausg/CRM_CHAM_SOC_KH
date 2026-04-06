'use client';

import * as XLSX from 'xlsx';
import { Customer, CustomerGroup, CareTask, PipelineItem, Script } from '@/lib/types';
import {
  setCustomers, setCustomerGroups, setCareTasks,
  setPipelineItems, setScripts
} from '@/lib/store';

function parseExcelDate(val: any): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'string') return val;
  if (typeof val === 'number') {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return d.toISOString().split('T')[0];
  }
  return String(val);
}

function parseNumber(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^\d]/g, '');
    return parseInt(cleaned) || 0;
  }
  return 0;
}

function cleanPhone(val: any): string {
  if (!val) return '';
  return String(val).replace(/[^\d]/g, '');
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function importExcelData(workbook: XLSX.WorkBook) {
  // Parse Danh sach KH
  const khSheet = workbook.Sheets['Danh sách KH'] || workbook.Sheets[workbook.SheetNames[0]];
  if (khSheet) {
    const rows: any[][] = XLSX.utils.sheet_to_json(khSheet, { header: 1 });
    const customers: Customer[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      customers.push({
        contractNo: String(row[0] || ''),
        product: String(row[1] || ''),
        issueDate: parseExcelDate(row[2]),
        status: String(row[3] || ''),
        agent: String(row[4] || ''),
        effectiveDate: parseExcelDate(row[5]),
        paymentCycle: String(row[6] || ''),
        dueDate: parseExcelDate(row[7]),
        premium: String(row[8] || ''),
        ape: String(row[9] || ''),
        pendingFee: String(row[10] || ''),
        policyHolder: String(row[11] || ''),
        insured: String(row[12] || ''),
        name: String(row[13] || ''),
        phone: cleanPhone(row[14]),
        premiumNumber: parseNumber(row[15]),
        apeNumber: parseNumber(row[16]),
        pendingFeeNumber: parseNumber(row[17]),
        dueDateObj: parseExcelDate(row[18]),
        daysToDue: typeof row[19] === 'number' ? row[19] : 0,
      });
    }
    setCustomers(customers);
  }

  // Parse Phan loai KH
  const plSheet = workbook.Sheets['Phân loại KH'] || workbook.Sheets[workbook.SheetNames[1]];
  if (plSheet) {
    const rows: any[][] = XLSX.utils.sheet_to_json(plSheet, { header: 1 });
    const groups: CustomerGroup[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      groups.push({
        name: String(row[0] || ''),
        totalApe: parseNumber(row[1]),
        group: String(row[2] || 'Thường'),
      });
    }
    setCustomerGroups(groups);
  }

  // Parse Cham soc
  const csSheet = workbook.Sheets['Chăm sóc'] || workbook.Sheets[workbook.SheetNames[3]];
  if (csSheet) {
    const rows: any[][] = XLSX.utils.sheet_to_json(csSheet, { header: 1 });
    const tasks: CareTask[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      tasks.push({
        id: generateId(),
        customerName: String(row[0] || ''),
        phone: cleanPhone(row[1]),
        dueDate: parseExcelDate(row[2]),
        paymentCycle: String(row[3] || ''),
        premium: parseNumber(row[4]),
        ape: parseNumber(row[5]),
        status: String(row[6] || ''),
        daysToDue: typeof row[7] === 'number' ? row[7] : 0,
        task: String(row[8] || ''),
        deadline: parseExcelDate(row[9]),
        notes: String(row[10] || ''),
        completed: false,
      });
    }
    setCareTasks(tasks);
  }

  // Parse Pipeline
  const pl2Sheet = workbook.Sheets['Pipeline'] || workbook.Sheets[workbook.SheetNames[4]];
  if (pl2Sheet) {
    const rows: any[][] = XLSX.utils.sheet_to_json(pl2Sheet, { header: 1 });
    const items: PipelineItem[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      items.push({
        id: generateId(),
        customer: String(row[0] || ''),
        stage: String(row[1] || 'Tiếp cận'),
        opportunity: String(row[2] || ''),
        value: parseNumber(row[3]),
        probability: parseNumber(row[4]),
        expectedRevenue: parseNumber(row[5]),
        nextStep: String(row[6] || ''),
        owner: String(row[7] || ''),
        notes: String(row[8] || ''),
      });
    }
    setPipelineItems(items);
  }

  // Parse Kich ban
  const kbSheet = workbook.Sheets['Kịch bản'] || workbook.Sheets[workbook.SheetNames[5]];
  if (kbSheet) {
    const rows: any[][] = XLSX.utils.sheet_to_json(kbSheet, { header: 1 });
    const sc: Script[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      sc.push({
        id: generateId(),
        situation: String(row[0] || ''),
        goal: String(row[1] || ''),
        content: String(row[2] || ''),
      });
    }
    setScripts(sc);
  }
}
