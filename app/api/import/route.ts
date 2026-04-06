import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, customerGroups, careTasks, pipelineItems, scripts } from '@/db/schema';

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

export async function POST(req: Request) {
  const body = await req.json();
  const { customers: custData, groups: groupData, tasks: taskData, pipeline: pipelineData, scriptsData } = body;

  // Clear existing data
  await db.delete(customers);
  await db.delete(customerGroups);
  await db.delete(careTasks);
  await db.delete(pipelineItems);
  await db.delete(scripts);

  // Insert customers
  if (custData?.length > 0) {
    await db.insert(customers).values(
      custData.map((row: any) => ({
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
      }))
    );
  }

  // Insert groups
  if (groupData?.length > 0) {
    await db.insert(customerGroups).values(
      groupData.map((row: any) => ({
        name: String(row[0] || ''),
        totalApe: parseNumber(row[1]),
        group: String(row[2] || 'Thường'),
      }))
    );
  }

  // Insert tasks
  if (taskData?.length > 0) {
    await db.insert(careTasks).values(
      taskData.map((row: any) => ({
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
      }))
    );
  }

  // Insert pipeline
  if (pipelineData?.length > 0) {
    await db.insert(pipelineItems).values(
      pipelineData.map((row: any) => ({
        customer: String(row[0] || ''),
        stage: String(row[1] || 'Tiếp cận'),
        opportunity: String(row[2] || ''),
        value: parseNumber(row[3]),
        probability: parseNumber(row[4]),
        expectedRevenue: parseNumber(row[5]),
        nextStep: String(row[6] || ''),
        owner: String(row[7] || ''),
        notes: String(row[8] || ''),
      }))
    );
  }

  // Insert scripts
  if (scriptsData?.length > 0) {
    await db.insert(scripts).values(
      scriptsData.map((row: any) => ({
        situation: String(row[0] || ''),
        goal: String(row[1] || ''),
        content: String(row[2] || ''),
      }))
    );
  }

  return NextResponse.json({ success: true });
}
