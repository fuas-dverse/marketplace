import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_BACKEND_URL = process.env.AUTH_BACKEND_URL;
const AUTH_FRONTEND_URL = process.env.AUTH_FRONTEND_URL;

export async function middleware(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    console.error("No access token found in cookies");
    return NextResponse.redirect(
      `${AUTH_FRONTEND_URL}/?redirect_url=${encodeURIComponent(request.url)}`
    );
  }

  try {
    const response = await fetch(`${AUTH_BACKEND_URL}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const user = await response.json();

      // Log the user data for debugging
      console.log("User data received from /verify:", user);

      const res = NextResponse.next();

      // Ensure the user data is serialized before setting the header
      res.headers.set("x-user", JSON.stringify(user.user));

      return res;
    } else {
      console.error(
        "Token verification failed:",
        response.status,
        await response.text()
      );
      return NextResponse.redirect(
        `${AUTH_FRONTEND_URL}/?redirect_url=${encodeURIComponent(request.url)}`
      );
    }
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(
      `${AUTH_FRONTEND_URL}/?redirect_url=${encodeURIComponent(request.url)}`
    );
  }
}
export const config = {
  matcher: ["/login/:path*", "/:path*"], // Middleware applies only to these routes
};
