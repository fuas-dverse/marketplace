import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.FASTAPI_URL;

// Add a review
export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const reviewData = await req.json();

    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...reviewData,
      }),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return NextResponse.json(
        { error: errorResponse.detail || "Error adding review" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to add review for product ${params.productId}, ${error}`,
      },
      { status: 500 }
    );
  }
}

// Get all reviews for a product
export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${params.productId}`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return NextResponse.json(
        { error: errorResponse.detail || `Reviews not found` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to fetch reviews for product with ID ${params.productId}, ${error}`,
      },
      { status: 500 }
    );
  }
}
