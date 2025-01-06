import { fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "@/components/Header";
import {
  renderWithNullUserProvider,
  renderWithUserProvider,
} from "./utils/renderWithProvider";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe("Header Component Tests", () => {
  const mockSetUser = jest.fn();

  it("should render the header component", () => {
    renderWithUserProvider(<Header />);
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
  });

  it("should render navigation links for a logged-out user", () => {
    renderWithNullUserProvider(<Header />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("should render navigation links for a logged-in user", () => {
    renderWithUserProvider(<Header />);

    expect(screen.getByText("Chat")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("should handle logout correctly", () => {
    renderWithUserProvider(<Header />, mockSetUser);

    const logoutButton = screen.getByText("Logout");

    // Simulate the click event
    fireEvent.click(logoutButton);

    // Assert that setUser was called with null
    expect(mockSetUser).toHaveBeenCalledWith(null);
  });
});
