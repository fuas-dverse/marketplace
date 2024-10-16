// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { username } = await request.json();
  // You should implement your login logic here.
  // For now, we return a mock user object
  return NextResponse.json({ username });
}
