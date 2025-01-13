import { cookies } from "next/headers";
const AUTH_BACKEND_URL = process.env.NEXT_PUBLIC_AUTH_BACKEND_URL; // ?? "http://localhost:8080/api/v1/auth";

export async function getUserFromRequest() {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;
  console.log("token", token);
  console.log("AUTH_BACKEND_URL", AUTH_BACKEND_URL);
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

    if (!response.ok) {
      throw new Error("Unauthorized");
    }
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user on server:", error);
  }

  return null;
}
