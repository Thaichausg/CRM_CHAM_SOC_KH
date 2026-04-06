import { NextResponse } from 'next/server';
import { db } from '@/db';
import { careTasks as tasksTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const data = await db.select().from(tasksTable);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await db.insert(tasksTable).values(body).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...updates } = body;
  if (id) {
    await db.update(tasksTable).set(updates).where(eq(tasksTable.id, parseInt(id)));
    const result = await db.select().from(tasksTable).where(eq(tasksTable.id, parseInt(id)));
    return NextResponse.json(result[0]);
  }
  return NextResponse.json({ error: 'Missing id' }, { status: 400 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    await db.delete(tasksTable).where(eq(tasksTable.id, parseInt(id)));
  }
  return NextResponse.json({ success: true });
}
