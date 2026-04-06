import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customers as customersTable, customerProfiles as profilesTable } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export async function GET() {
  const contracts = await db.select().from(customersTable);
  const profiles = await db.select().from(profilesTable);
  
  const profileMap = new Map(profiles.map(p => [p.name?.toLowerCase() || p.phone, p]));
  
  const data = contracts.map(c => {
    const key = c.name?.toLowerCase() || c.phone;
    const profile = profileMap.get(key);
    return {
      ...c,
      profile: profile || null,
    };
  });
  
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await db.insert(customersTable).values(body).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    await db.delete(customersTable).where(eq(customersTable.id, parseInt(id)));
  }
  return NextResponse.json({ success: true });
}
