import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customerProfiles } from '@/db/schema';

export async function GET() {
  const data = await db.select().from(customerProfiles);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await db.insert(customerProfiles).values(body).returning();
  return NextResponse.json(result[0]);
}
