// src/app/api/products/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch("http://localhost:8000/products"); // Replace with your FastAPI URL
  const data = await response.json();

  return NextResponse.json(data);
}
