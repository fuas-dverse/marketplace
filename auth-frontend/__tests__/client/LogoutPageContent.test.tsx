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

    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === "redirect_url") {
          return "/dashboard";
        }
        return null;
      }),
    });

    jest.clearAllMocks();
  });

  it("should render the logging out message", () => {
    render(<LogoutPageContent />);
    expect(screen.getByText("Logging out...")).toBeInTheDocument();
  });

  it("should call logout and redirect to the correct URL on success", async () => {
    (logout as jest.Mock).mockResolvedValueOnce({
      success: true,
    });

    render(<LogoutPageContent />);

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
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
      expect(logout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/");
    });
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
      expect(logout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
