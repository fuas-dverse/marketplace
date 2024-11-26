import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.FASTAPI_URL;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const username = url.pathname.split("/").pop();
  try {
    const res = await fetch(`${API_BASE_URL}/users/${username}`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return NextResponse.json(
        { error: errorResponse.detail || `User not found` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch user with username ${username}` },
      { status: 500 }
    );
  }
}
