"use server";

import { cookies } from "next/headers";

const AUTH_BASE_URL =
  process.env.AUTH_BACKEND_URL || "http://localhost:8080/api/v1/auth";

export async function signIn(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, message: "Username and password are required" };
  }

  try {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`, // Send Basic Auth header
      },
    });

    if (response.ok) {
      const data = await response.json();
      const accessToken = data.access_token;

      const cookieStore = await cookies();
      cookieStore.set("access_token", accessToken, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true, // Prevent JavaScript access
      });

      return { success: true, message: "Signed in successfully" };
    } else {
      const errorMessage = (await response.json())?.error || "Login failed";
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    return {
      success: false,
      message: `An error occurred during sign-in: ${error}`,
    };
  }
}

export async function signUp(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!username || !password || !confirmPassword) {
    return { success: false, message: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match" };
  }

  try {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      return { success: true, message: "[Auth] Account created successfully" };
    } else {
      const errorMessage =
        (await response.json())?.error || "Registration failed";
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    return {
      success: false,
      message: `An error occurred during sign-up: ${error}`,
    };
  }
}

export async function validateToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return { valid: false, user: null, error: "No token found" };
  }

  try {
    const response = await fetch(`${AUTH_BASE_URL}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const user = await response.json();
      return { valid: true, user, error: null };
    } else {
      const errorMessage = await response.text();
      return {
        valid: false,
        user: null,
        error: errorMessage || "Invalid token",
      };
    }
  } catch (error) {
    console.error("Token validation error:", error);
    return {
      valid: false,
      user: null,
      error: "Server error during token validation",
    };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("access_token", "", {
      maxAge: 0, // Expire the cookie immediately
      httpOnly: true, // Prevent JavaScript access
    });

    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Error during logout:", error);
    return { success: false, message: "An error occurred during logout" };
  }
}
