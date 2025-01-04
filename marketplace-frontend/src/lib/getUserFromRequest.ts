import { cookies } from "next/headers";
const AUTH_BACKEND_URL =
  process.env.AUTH_BACKEND_URL || "http://localhost:8080/api/v1/auth";

export async function getUserFromRequest() {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return null;
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
      return user;
    }
  } catch (error) {
    console.error("Error fetching user on server:", error);
  }

  return null;
}
