/**
 * @jest-environment node
 */
import { signIn, signUp, validateToken, logout } from "@/app/actions/auth";
import { cookies } from "next/headers";

// Mocking `cookies` and `fetch`
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

global.fetch = jest.fn() as jest.Mock;

describe("Auth Functions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signIn", () => {
    it("should return an error if username or password is missing", async () => {
      const formData = new FormData();
      const result = await signIn(formData);

      expect(result).toEqual({
        success: false,
        message: "Username and password are required",
      });
    });

    it("should sign in successfully with valid credentials", async () => {
      const formData = new FormData();
      formData.set("username", "testuser");
      formData.set("password", "password");

      const mockCookieStore = {
        set: jest.fn(),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "mock_token" }),
      } as Partial<Response> as Response);

      const result = await signIn(formData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/login"),
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: expect.stringContaining("Basic"),
          },
        })
      );
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "access_token",
        "mock_token",
        {
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: true,
        }
      );
      expect(result).toEqual({
        success: true,
        message: "Signed in successfully",
      });
    });

    it("should handle server errors during sign-in", async () => {
      const formData = new FormData();
      formData.set("username", "testuser");
      formData.set("password", "password");

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Invalid credentials" }),
      } as Partial<Response> as Response);

      const result = await signIn(formData);

      expect(result).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });
  });

  describe("signUp", () => {
    it("should return an error if fields are missing", async () => {
      const formData = new FormData();
      const result = await signUp(formData);

      expect(result).toEqual({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return an error if passwords do not match", async () => {
      const formData = new FormData();
      formData.set("username", "testuser");
      formData.set("password", "password");
      formData.set("confirmPassword", "differentPassword");

      const result = await signUp(formData);

      expect(result).toEqual({
        success: false,
        message: "Passwords do not match",
      });
    });

    it("should sign up successfully with valid data", async () => {
      const formData = new FormData();
      formData.set("username", "testuser");
      formData.set("password", "password");
      formData.set("confirmPassword", "password");

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      } as Partial<Response> as Response);

      const result = await signUp(formData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/register"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ username: "testuser", password: "password" }),
        })
      );
      expect(result).toEqual({
        success: true,
        message: "[Auth] Account created successfully",
      });
    });
  });

  describe("validateToken", () => {
    it("should return an error if no token is found", async () => {
      (cookies as jest.Mock).mockReturnValue({
        get: jest.fn(() => null),
      });

      const result = await validateToken();

      expect(result).toEqual({
        valid: false,
        user: null,
        error: "No token found",
      });
    });

    it("should validate token successfully", async () => {
      (cookies as jest.Mock).mockReturnValue({
        get: jest.fn(() => ({ value: "mock_token" })),
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, username: "testuser" }),
      } as Partial<Response> as Response);

      const result = await validateToken();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/verify"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock_token",
            "Content-Type": "application/json",
          }),
          method: "GET",
        })
      );

      expect(result).toEqual({
        valid: true,
        user: { id: 1, username: "testuser" },
        error: null,
      });
    });
  });

  describe("logout", () => {
    it("should clear the access token cookie", async () => {
      const mockCookieStore = {
        set: jest.fn(),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      const result = await logout();

      expect(mockCookieStore.set).toHaveBeenCalledWith("access_token", "", {
        maxAge: 0,
        httpOnly: true,
      });
      expect(result).toEqual({
        success: true,
        message: "Logged out successfully",
      });
    });
  });
});
