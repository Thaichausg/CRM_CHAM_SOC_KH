import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customerGroups as groupsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const data = await db.select().from(groupsTable);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await db.insert(groupsTable).values(body).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    await db.delete(groupsTable).where(eq(groupsTable.id, parseInt(id)));
  }
  return NextResponse.json({ success: true });
}
