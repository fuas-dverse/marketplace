import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "@/components/Header";
import { UserContext } from "@/contexts/UserProvider";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe("Header Component Tests", () => {
  const mockSetUser = jest.fn();
  const mockRouter = {
    push: jest.fn(),
  };

  const renderWithUserProvider = (user = null) => {
    render(
      <UserContext.Provider
        value={{
          user,
          setUser: mockSetUser,
          loading: false,
          error: null,
        }}
      >
        <Header />
      </UserContext.Provider>
    );
  };

  it("should render the header component", () => {
    renderWithUserProvider();
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
  });

  it("should render navigation links for a logged-out user", () => {
    renderWithUserProvider();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("should render navigation links for a logged-in user", () => {
    const mockUser = { username: "johndoe" };
    renderWithUserProvider(mockUser);

    expect(screen.getByText("Chat")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("should handle logout correctly", () => {
    const mockUser = { username: "johndoe" };
    renderWithUserProvider(mockUser);

    const logoutButton = screen.getByText("Logout");
    logoutButton.click();

    expect(mockSetUser).toHaveBeenCalledWith(null);
  });
});
