"use server";

const API_URL = process.env.API_BASE_URL ?? "http://api-gateway:8080/api/v1";

export async function addUser(username: string) {
  try {
    const response = await fetch(`${API_URL}/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
    });
    if (response.ok) {
      return { success: true, message: "[Users] Account created successfully" };
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
