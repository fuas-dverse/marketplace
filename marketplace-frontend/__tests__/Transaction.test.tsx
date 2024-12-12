import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserContext } from "@/contexts/UserProvider";
import { Product } from "@/types/marketplace.types";
import TransactionModal from "@/components/Transaction";

// Mock the fetch API
global.fetch = jest.fn((url, options) => {
  if (url.includes("/api/products/")) {
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          id: "1",
          title: "Test Product",
          description: "This is a test product.",
          price: "100",
        }),
      ok: true,
    });
  }
  if (url.includes("/api/transactions/")) {
    return Promise.resolve({
      json: () => Promise.resolve({ message: "Transaction complete" }),
      ok: true,
    });
  }
  return Promise.reject(new Error("Unknown URL"));
}) as jest.Mock;

// Mock user data
const mockUser = {
  id: "user123",
  name: "Test User",
  email: "testuser@example.com",
  role: "buyer",
};

// Mock product data
const mockProduct: Product = {
  id: "1",
  title: "Test Product",
  description: "This is a test product.",
  price: "100",
};

// Mock UserProvider
const MockUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <UserContext.Provider value={{ user: mockUser }}>
      {children}
    </UserContext.Provider>
  );
};

describe("TransactionModal Component Tests", () => {
  const renderWithUserProvider = (ui: React.ReactElement) => {
    return render(<MockUserProvider>{ui}</MockUserProvider>);
  };

  it("should render the modal with product details", async () => {
    await act(async () => {
      renderWithUserProvider(
        <TransactionModal productId={mockProduct.id!} onClose={jest.fn()} />
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("This is a test product.")).toBeInTheDocument();
      expect(screen.getByText("Price: $100")).toBeInTheDocument();
      expect(screen.getByTestId("confirm-purchase-button")).toBeInTheDocument();
    });
  });

  it("should display an error if the user is not logged in", async () => {
    const MockUserProviderNoUser: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => {
      return (
        <UserContext.Provider value={{ user: null }}>
          {children}
        </UserContext.Provider>
      );
    };

    render(
      <MockUserProviderNoUser>
        <TransactionModal productId={mockProduct.id!} onClose={jest.fn()} />
      </MockUserProviderNoUser>
    );

    // Wait for the modal and button to appear
    await waitFor(() => {
      expect(screen.getByTestId("confirm-purchase-button")).toBeInTheDocument();
    });

    // Simulate clicking the button
    fireEvent.click(screen.getByTestId("confirm-purchase-button"));

    // Check for the error message
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "You must be logged in to make a purchase."
      );
    });
  });

  it("should handle a successful transaction", async () => {
    await act(async () => {
      renderWithUserProvider(
        <TransactionModal productId={mockProduct.id!} onClose={jest.fn()} />
      );
    });

    fireEvent.click(screen.getByTestId("confirm-purchase-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/transactions/",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "complete",
            product_id: mockProduct.id,
            buyer_id: mockUser.id,
          }),
        })
      );
    });
  });

  it("should call onClose when the close button is clicked", async () => {
    const onCloseMock = jest.fn();
    await act(async () => {
      renderWithUserProvider(
        <TransactionModal productId={mockProduct.id!} onClose={onCloseMock} />
      );
    });

    fireEvent.click(screen.getByTestId("close-transaction-modal"));

    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });
});
