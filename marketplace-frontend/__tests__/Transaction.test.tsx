import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserContext } from "@/contexts/UserProvider";
import { Product } from "@/types/marketplace.types";
import TransactionModal from "@/components/Transaction";

// Mock the fetch API
global.fetch = jest.fn((url) => {
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

  it("should render the modal with product details", () => {
    renderWithUserProvider(
      <TransactionModal product={mockProduct} onClose={jest.fn()} />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(
      screen.getByText(`Price: $${mockProduct.price}`)
    ).toBeInTheDocument();
    expect(screen.getByTestId("confirm-purchase-button")).toBeInTheDocument();
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
        <TransactionModal product={mockProduct} onClose={jest.fn()} />
      </MockUserProviderNoUser>
    );

    fireEvent.click(screen.getByTestId("confirm-purchase-button"));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "You must be logged in to make a purchase."
      );
    });
  });

  it("should handle a successful transaction", async () => {
    renderWithUserProvider(
      <TransactionModal product={mockProduct} onClose={jest.fn()} />
    );

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

  it("should call onClose when the close button is clicked", () => {
    const onCloseMock = jest.fn();
    renderWithUserProvider(
      <TransactionModal product={mockProduct} onClose={onCloseMock} />
    );

    fireEvent.click(screen.getByTestId("close-transaction-modal"));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
