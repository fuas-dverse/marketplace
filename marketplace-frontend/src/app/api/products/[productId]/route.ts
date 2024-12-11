import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_URL;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const productId = url.pathname.split("/").pop();
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return NextResponse.json(
        { error: errorResponse.detail || `Product not found` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch product with ID ${productId}, ${error}` },
      { status: 500 }
    );
  }
}
