import { logout } from "@/app/actions/auth";
import LogoutPageContent from "@/components/LogoutPageContent";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/app/actions/auth", () => ({
  logout: jest.fn(),
}));

describe("LogoutPageContent", () => {
  const mockPush = jest.fn();

  beforeAll(() => {
    window.alert = jest.fn(); // Mock alert globally
  });

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useSearchParams as jest.Mock).mockImplementation(() => ({
      get: jest.fn((key: string) => {
        if (key === "redirect_url") {
          return "/dashboard"; // Simulate the expected behavior
        }
        return null;
      }),
    }));

    jest.clearAllMocks();
  });

  it("should render the logging out message", () => {
    render(<LogoutPageContent />);
    expect(screen.getByText("Logging out...")).toBeInTheDocument();
  });

  it("should mock useSearchParams correctly", () => {
    const searchParams = useSearchParams();
    const value = searchParams.get("redirect_url");
    expect(value).toBe("/dashboard");
  });

  it("should call logout and redirect to the correct URL on success", async () => {
    (logout as jest.Mock).mockResolvedValueOnce({
      success: true,
    });
    render(<LogoutPageContent />);

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should call logout and redirect to home on failure", async () => {
    (logout as jest.Mock).mockResolvedValueOnce({
      success: false,
      message: "Logout failed",
    });

    render(<LogoutPageContent />);

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("should call console.error and alert when logout throws an error", async () => {
    // Mock the logout function to throw an error
    (logout as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Network error");
    });

    // Mock console.error and alert
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<LogoutPageContent />);

    await waitFor(() => {
      // Assert console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Logout encountered an error:",
        expect.any(Error)
      );

      // Assert alert was called
      expect(alertSpy).toHaveBeenCalledWith(
        "An unexpected error occurred. Please try again."
      );
    });

    // Clean up mocks
    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("should handle missing redirect_url and default to home", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => null),
    });

    (logout as jest.Mock).mockResolvedValueOnce({
      success: true,
    });

    render(<LogoutPageContent />);

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
