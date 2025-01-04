import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("ProtectedPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to '/' if not authenticated", () => {
    render(<ProtectedPage isAuthenticated={false} user={null} />);

    expect(mockPush).toHaveBeenCalledWith("/");
    expect(screen.getByText("Redirecting...")).toBeInTheDocument();
  });

  it("should display the protected content when authenticated", () => {
    render(
      <ProtectedPage isAuthenticated={true} user={{ username: "testuser" }} />
    );

    expect(mockPush).not.toHaveBeenCalled();
    expect(
      screen.getByText("Welcome to the Protected Page")
    ).toBeInTheDocument();
    expect(screen.getByText("Hello, testuser!")).toBeInTheDocument();
  });

  it("should display the protected content without user details", () => {
    render(<ProtectedPage isAuthenticated={true} user={null} />);

    expect(mockPush).not.toHaveBeenCalled();
    expect(
      screen.getByText("Welcome to the Protected Page")
    ).toBeInTheDocument();
    expect(screen.queryByText("Hello,")).not.toBeInTheDocument();
  });
});
