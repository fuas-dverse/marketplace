import { render, screen, act, cleanup, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductList from "@/components/ProductList";
import "whatwg-fetch"; // Polyfill for fetch

// Mock fetch API to match the actual API response structure
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url === "api/products") {
      return Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              id: 1,
              title: "Test 1",
              description: "cool 1",
              price: 500,
              average_rating: 4,
              rating_count: 1,
              seller_id: 1,
            },
            {
              id: 2,
              title: "Test 2",
              description: "cool 2",
              price: 500,
              average_rating: 4,
              rating_count: 1,
              seller_id: 1,
            },
          ]),
      });
    }
    return Promise.reject(new Error("Unexpected URL"));
  }) as jest.Mock;
});

// Clean up mocks and DOM after each test
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe("ProductList Component Tests", () => {
  it("should render the Product List title", async () => {
    await act(async () => {
      render(<ProductList />);
    });
    const titleElement = screen.getByTestId("product-list-title");
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.textContent).toBe("Product List");
  });

  it("should render products when fetched successfully", async () => {
    await act(async () => {
      render(<ProductList />);
    });

    const productElements = await screen.findAllByTestId(/product-\d+/);
    expect(productElements.length).toBe(2); // Matches the mock response
    expect(productElements[0]).toHaveTextContent("Test 1");
    expect(productElements[0]).toHaveTextContent("$500");
  });

  it("should display no products message when no products are available", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve([]), // Return empty array for no products
      })
    );

    await act(async () => {
      render(<ProductList />);
    });

    const noProductsMessage = screen.getByTestId("no-products-message");
    expect(noProductsMessage).toBeInTheDocument();
    expect(noProductsMessage.textContent).toBe(
      "No products available. Add one to get started!"
    );
  });

  it("should have an Add Product button with correct text", async () => {
    await act(async () => {
      render(<ProductList />);
    });
    const addButton = screen.getByTestId("add-product-button");
    expect(addButton).toBeInTheDocument();
    expect(addButton.textContent).toBe("+ Add Product");
  });
});
