import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductForm from "@/components/ProductForm";
import { UserContext } from "@/contexts/UserProvider";

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: "Product created successfully" }),
  })
) as jest.Mock;

describe("ProductForm Component Tests", () => {
  const mockSetUser = jest.fn();
  const mockOnSuccess = jest.fn();

  // Utility to render with UserProvider
  const renderWithUserProvider = (
    component: React.ReactNode,
    user = { id: 1, username: "testuser" }
  ) => {
    return render(
      <UserContext.Provider
        value={{
          user,
          setUser: mockSetUser,
          loading: false,
          error: null,
        }}
      >
        {component}
      </UserContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the ProductForm component with all fields", () => {
    renderWithUserProvider(<ProductForm onSuccess={mockOnSuccess} />);
    expect(screen.getByTestId("input-title")).toBeInTheDocument();
    expect(screen.getByTestId("input-description")).toBeInTheDocument();
    expect(screen.getByTestId("input-price")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  it("should allow user to fill out the form fields", () => {
    renderWithUserProvider(<ProductForm onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByTestId("input-title"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByTestId("input-description"), {
      target: { value: "This is a test product" },
    });
    fireEvent.change(screen.getByTestId("input-price"), {
      target: { value: 100 },
    });

    expect(screen.getByTestId("input-title")).toHaveValue("Test Product");
    expect(screen.getByTestId("input-description")).toHaveValue(
      "This is a test product"
    );
    expect(screen.getByTestId("input-price")).toHaveValue(100);
  });

  it("should submit the form and clear the fields on success", async () => {
    renderWithUserProvider(<ProductForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByTestId("input-title"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByTestId("input-description"), {
      target: { value: "This is a test product" },
    });
    fireEvent.change(screen.getByTestId("input-price"), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByTestId("submit-button"));

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByTestId("success-message")).toBeInTheDocument();
    });

    // Verify form fields are cleared
    await waitFor(() => {
      expect(screen.getByTestId("input-title")).toHaveValue("");
      expect(screen.getByTestId("input-description")).toHaveValue("");
      expect(screen.getByTestId("input-price")).toHaveValue("");
    });

    // Verify onSuccess callback is called
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("should display a success message after form submission", async () => {
    renderWithUserProvider(<ProductForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByTestId("input-title"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByTestId("input-description"), {
      target: { value: "This is a test product" },
    });
    fireEvent.change(screen.getByTestId("input-price"), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(screen.getByTestId("success-message")).toBeInTheDocument();
    });
  });

  it("should show an error if the user context has an error", () => {
    render(
      <UserContext.Provider
        value={{
          user: null,
          setUser: mockSetUser,
          loading: false,
          error: "User context error",
        }}
      >
        <ProductForm onSuccess={mockOnSuccess} />
      </UserContext.Provider>
    );

    expect(screen.getByText("Error: User context error")).toBeInTheDocument();
  });
});
