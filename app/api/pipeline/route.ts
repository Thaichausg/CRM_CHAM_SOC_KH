import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pipelineItems as pipelineTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const data = await db.select().from(pipelineTable);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await db.insert(pipelineTable).values(body).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...updates } = body;
  if (id) {
    await db.update(pipelineTable).set(updates).where(eq(pipelineTable.id, parseInt(id)));
    const result = await db.select().from(pipelineTable).where(eq(pipelineTable.id, parseInt(id)));
    return NextResponse.json(result[0]);
  }
  return NextResponse.json({ error: 'Missing id' }, { status: 400 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    await db.delete(pipelineTable).where(eq(pipelineTable.id, parseInt(id)));
  }
  return NextResponse.json({ success: true });
}
