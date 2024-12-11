import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_URL;

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
      { error: `Failed to fetch user with username ${username}, ${error}` },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const username = url.pathname.split("/").pop();
  const body = await req.json();

  try {
    const res = await fetch(`${API_BASE_URL}/users/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return NextResponse.json(
        { error: errorResponse.detail || `Failed to update user` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update user with username ${username}, ${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const username = url.pathname.split("/").pop();

  try {
    const res = await fetch(`${API_BASE_URL}/users/${username}`, {
      method: "DELETE",
    });

    if (res.status !== 204) {
      const errorResponse = await res.json();
      return NextResponse.json(
        { error: errorResponse.detail || `Failed to delete user` },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: `User ${username} deleted successfully` },
      { status: 204 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete user with username ${username}, ${error}` },
      { status: 500 }
    );
  }
}
