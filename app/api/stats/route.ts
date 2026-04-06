import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, customerGroups, careTasks, pipelineItems, scripts } from '@/db/schema';

export async function GET() {
  const allCustomers = await db.select().from(customers);
  const allGroups = await db.select().from(customerGroups);
  const allTasks = await db.select().from(careTasks);
  const allPipeline = await db.select().from(pipelineItems);
  const allScripts = await db.select().from(scripts);

  const totalContracts = allCustomers.length;
  const totalApe = allCustomers.reduce((sum, c) => sum + (c.apeNumber || 0), 0);
  const totalPremium = allCustomers.reduce((sum, c) => sum + (c.premiumNumber || 0), 0);
  const activeContracts = allCustomers.filter(c => c.status?.includes('Đang hiệu lực')).length;
  const lapsedContracts = allCustomers.filter(c => c.status?.includes('Mất hiệu lực')).length;
  const dueSoon = allTasks.filter(t => (t.daysToDue || 0) >= 0 && (t.daysToDue || 0) <= 30).length;
  const overdue = allTasks.filter(t => (t.daysToDue || 0) < 0).length;
  const pipelineValue = allPipeline.reduce((sum, p) => sum + (p.value || 0), 0);
  const expectedRevenue = allPipeline.reduce((sum, p) => sum + (p.expectedRevenue || 0), 0);
  const vipCustomers = allGroups.filter(g => g.group === 'VIP').length;

  return NextResponse.json({
    totalContracts, totalApe, totalPremium, activeContracts,
    lapsedContracts, dueSoon, overdue, pipelineValue,
    expectedRevenue, vipCustomers,
  });
}
