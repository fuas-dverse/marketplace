import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_URL;

export async function POST(req: NextRequest) {
  try {
    const transactionData = await req.json();

    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...transactionData,
      }),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return NextResponse.json(
        { error: errorResponse.detail || "Error adding transaction" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to add transaction for: ${req.body}, ${error}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions/`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return NextResponse.json(
        { error: errorResponse.detail || "No products found" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch products, ${error}` },
      { status: 500 }
    );
  }
}
