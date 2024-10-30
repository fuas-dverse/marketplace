import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.FASTAPI_URL;

// Add a review and update product rating
export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const reviewData = await req.json();
    const { productId } = params;

    const res = await fetch(
      `${API_BASE_URL}/api/products/${productId}/review/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...reviewData,
          average_rating: 0,
          rating_count: 0,
        }),
      }
    );

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
      { error: `Failed to add review for product ${params.productId}` },
      { status: 500 }
    );
  }
}
