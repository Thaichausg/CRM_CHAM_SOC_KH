import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scripts as scriptsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const data = await db.select().from(scriptsTable);
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...updates } = body;
  if (id) {
    await db.update(scriptsTable).set(updates).where(eq(scriptsTable.id, parseInt(id)));
    const result = await db.select().from(scriptsTable).where(eq(scriptsTable.id, parseInt(id)));
    return NextResponse.json(result[0]);
  }
  return NextResponse.json({ error: 'Missing id' }, { status: 400 });
}
