import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.FASTAPI_URL;

// Add a new product
export async function POST(req: NextRequest) {
  try {
    const productData = await req.json();

    const res = await fetch(`${API_BASE_URL}/api/products/`, {
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
    const res = await fetch(`${API_BASE_URL}/api/products/`, {
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

// Get a product by ID
export async function GETById(req: NextRequest) {
  const url = new URL(req.url);
  const productId = url.pathname.split("/").pop();
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
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
      { error: `Failed to fetch product with ID ${productId}` },
      { status: 500 }
    );
  }
}

// Add a review and update product rating
export async function POSTReview(
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
        body: JSON.stringify(reviewData),
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
