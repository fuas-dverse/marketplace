import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Product } from "@/types/marketplace.types";
import TransactionModal from "@/components/Transaction";
import {
  renderWithNullUserProvider,
  renderWithUserProvider,
} from "./utils/renderWithProvider";

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
      status: 200,
      headers: {
        get: () => "application/json",
      },
    });
  }
  if (url.includes("/api/transactions/")) {
    return Promise.resolve({
      json: () => Promise.resolve({ message: "Transaction complete" }),
      ok: true,
      status: 201,
      headers: {
        get: () => "application/json",
      },
    });
  }
  return Promise.reject(new Error("Unknown URL"));
}) as jest.Mock;

// Mock product data
const mockProduct: Product = {
  id: "1",
  title: "Test Product",
  description: "This is a test product.",
  price: "100",
};

describe("TransactionModal Component Tests", () => {
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
    renderWithNullUserProvider(
      <TransactionModal productId={mockProduct.id!} onClose={jest.fn()} />
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
      const transactionCall = (global.fetch as jest.Mock).mock.calls.find(
        ([url]: [string]) => url === "/api/transactions/"
      );
      expect(transactionCall).toBeDefined();
      expect(transactionCall[1]).toMatchObject({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "complete",
          product_id: mockProduct.id,
          buyer_id: "123",
          amount: "100",
        }),
      });
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
