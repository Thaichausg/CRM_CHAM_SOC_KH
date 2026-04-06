import 'dotenv/config';
import * as XLSX from 'xlsx';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { customers, customerGroups, careTasks, pipelineItems, scripts } from '../db/schema.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema: { customers, customerGroups, careTasks, pipelineItems, scripts } });

function cleanPhone(val: any): string {
  if (!val) return '';
  return String(val).replace(/[^\d]/g, '');
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

async function importData() {
  console.log('📖 Reading Excel file...');
  const workbook = XLSX.readFile('../HTC_Integrated_CRM_PRO_FINAL.xlsx');

  console.log('🧹 Clearing existing data...');
  await db.delete(customers);
  await db.delete(customerGroups);
  await db.delete(careTasks);
  await db.delete(pipelineItems);
  await db.delete(scripts);

  // Import customers
  console.log('📥 Importing customers...');
  const khSheet = workbook.Sheets['Danh sách KH'];
  if (khSheet) {
    const rows: any[][] = XLSX.utils.sheet_to_json(khSheet, { header: 1 });
    const customerData = rows.slice(1).filter(r => r[0]).map(row => ({
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
    }));
    await db.insert(customers).values(customerData);
    console.log(`   ✅ Imported ${customerData.length} customers`);
  }

  // Import groups
  console.log('📥 Importing customer groups...');
  const plSheet = workbook.Sheets['Phân loại KH'];
  if (plSheet) {
    const rows: any[][] = XLSX.utils.sheet_to_json(plSheet, { header: 1 });
    const groupData = rows.slice(1).filter(r => r[0]).map(row => ({
      name: String(row[0] || ''),
      totalApe: parseNumber(row[1]),
      group: String(row[2] || 'Thường'),
    }));
    await db.insert(customerGroups).values(groupData);
    console.log(`   ✅ Imported ${groupData.length} groups`);
  }

  // Import tasks
  console.log('📥 Importing care tasks...');
  const csSheet = workbook.Sheets['Chăm sóc'];
  if (csSheet) {
    const rows: any[][] = XLSX.utils.sheet_to_json(csSheet, { header: 1 });
    const taskData = rows.slice(1).filter(r => r[0]).map(row => ({
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
    }));
    await db.insert(careTasks).values(taskData);
    console.log(`   ✅ Imported ${taskData.length} tasks`);
  }

  // Import pipeline
  console.log('📥 Importing pipeline...');
  const pl2Sheet = workbook.Sheets['Pipeline'];
  if (pl2Sheet) {
    const rows: any[][] = XLSX.utils.sheet_to_json(pl2Sheet, { header: 1 });
    const pipelineData = rows.slice(1).filter(r => r[0]).map(row => ({
      customer: String(row[0] || ''),
      stage: String(row[1] || 'Tiếp cận'),
      opportunity: String(row[2] || ''),
      value: parseNumber(row[3]),
      probability: parseNumber(row[4]),
      expectedRevenue: parseNumber(row[5]),
      nextStep: String(row[6] || ''),
      owner: String(row[7] || ''),
      notes: String(row[8] || ''),
    }));
    if (pipelineData.length > 0) {
      await db.insert(pipelineItems).values(pipelineData);
      console.log(`   ✅ Imported ${pipelineData.length} pipeline items`);
    }
  }

  // Import scripts
  console.log('📥 Importing scripts...');
  const kbSheet = workbook.Sheets['Kịch bản'];
  if (kbSheet) {
    const rows: any[][] = XLSX.utils.sheet_to_json(kbSheet, { header: 1 });
    const scriptData = rows.slice(1).filter(r => r[0]).map(row => ({
      situation: String(row[0] || ''),
      goal: String(row[1] || ''),
      content: String(row[2] || ''),
    }));
    await db.insert(scripts).values(scriptData);
    console.log(`   ✅ Imported ${scriptData.length} scripts`);
  }

  console.log('✅ Import completed!');
  await pool.end();
  process.exit(0);
}

importData().catch(console.error);