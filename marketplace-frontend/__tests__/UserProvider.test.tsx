import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserProvider, UserContext, useUser } from "@/contexts/UserProvider";
import React from "react";

// Mock `sessionStorage`
beforeAll(() => {
  Object.defineProperty(window, "sessionStorage", {
    value: {
      getItem: jest.fn() as jest.Mock, // Explicitly cast as jest.Mock
      setItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

global.fetch = jest.fn();

describe("UserProvider and useUser Hook Tests", () => {
  const mockUser = {
    id: "user123",
    username: "TestUser",
    email: "testuser@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch user data and update state", async () => {
    // Mock sessionStorage and fetch response
    (sessionStorage.getItem as jest.Mock).mockReturnValue(null); // Simulate no username in sessionStorage
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }), // Mock API response
    });

    render(
      <UserProvider initialUser={null}>
        <UserContext.Consumer>
          {(context) => (
            <>
              <div data-testid="loading">{String(context?.loading)}</div>
              <div data-testid="user">
                {context?.user ? context.user.username : "No User"}
              </div>
            </>
          )}
        </UserContext.Consumer>
      </UserProvider>
    );

    // Assert loading state is true initially
    expect(screen.getByTestId("loading").textContent).toBe("true");

    // Wait for fetch and state update
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("user").textContent).toBe(mockUser.username);
    });

    // Verify sessionStorage.setItem was called
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      "username",
      JSON.stringify(mockUser.username)
    );

    // Verify fetch was called with correct endpoint
    expect(global.fetch).toHaveBeenCalledWith("/api/get-user");
  });

  it("should handle fetch error and set error state", async () => {
    // Mock sessionStorage and fetch error
    (sessionStorage.getItem as jest.Mock).mockReturnValue("TestUser");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: "Not Found",
      json: async () => ({ error: true }),
    });

    render(
      <UserProvider>
        <UserContext.Consumer>
          {(context) => (
            <>
              <div data-testid="loading">{String(context?.loading)}</div>
              <div data-testid="error">{context?.error || "No Error"}</div>
            </>
          )}
        </UserContext.Consumer>
      </UserProvider>
    );

    // Wait for the fetch to resolve
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Check if error state is updated
    expect(screen.getByTestId("error")).toHaveTextContent(
      "Failed to fetch user"
    );
  });

  it("should throw an error if useUser is used outside UserProvider", () => {
    const TestComponent = () => {
      useUser();
      return null;
    };

    // Expect the component to throw an error
    expect(() => render(<TestComponent />)).toThrow(
      "useUser must be used within a UserProvider"
    );
  });
});
