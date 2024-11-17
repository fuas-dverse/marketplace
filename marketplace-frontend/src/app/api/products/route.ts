import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.FASTAPI_URL;

// Add a new product
export async function POST(req: NextRequest) {
  try {
    const productData = await req.json();

    const res = await fetch(`${API_BASE_URL}/products/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return NextResponse.json(
        { error: errorResponse.detail || "Error creating product" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// Get all products
export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/products/`, {
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
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
