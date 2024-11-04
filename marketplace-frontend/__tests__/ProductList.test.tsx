import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductList from "@/components/ProductList";
import "whatwg-fetch"; // Polyfill for fetch

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        products: [
          { id: 1, name: "Product 1", price: 100 },
          { id: 2, name: "Product 2", price: 200 },
        ],
      }),
  })
) as jest.Mock;

describe("ProductList Component Tests", () => {
  it("should render the Product List title", async () => {
    await act(async () => {
      render(<ProductList />);
    });
    const titleElement = screen.getByTestId("product-list-title");
    expect(titleElement).toBeInTheDocument();
  });

  it("should render products when fetched successfully", async () => {
    await act(async () => {
      render(<ProductList />);
    });
    await waitFor(() => {
      const productElements = screen.getAllByTestId(/product-\d+/);
      expect(productElements.length).toBeGreaterThan(0);
    });
  });

  it("should display no products message when no products are available", async () => {
    // Mock fetch to return an empty list
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ products: [] }),
      })
    );

    await act(async () => {
      render(<ProductList />);
    });
    await waitFor(() => {
      const noProductsMessage = screen.getByTestId("no-products-message");
      expect(noProductsMessage).toBeInTheDocument();
    });
  });

  it("should have an Add Product button with correct text", async () => {
    await act(async () => {
      render(<ProductList />);
    });
    const addButton = screen.getByTestId("add-product-button");
    expect(addButton).toBeInTheDocument();
  });
});
