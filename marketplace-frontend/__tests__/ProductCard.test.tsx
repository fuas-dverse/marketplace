import { screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductCard from "@/components/ProductCard";
import "whatwg-fetch"; // Polyfill for fetch
import { renderWithUserProvider } from "./utils/renderWithProvider";

// Mock the fetch API
global.fetch = jest.fn();

describe("ProductCard Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render product details on successful fetch", async () => {
    // Mock successful fetch responses for product and reviews
    (fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/api/products/1")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              id: "1",
              title: "Test Product",
              description: "This is a test product",
              price: 100,
              average_rating: 4.5,
              reviews: [],
            }),
        });
      }
      if (url.includes("/api/products/1/reviews")) {
        return Promise.resolve({
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    await act(async () => {
      renderWithUserProvider(<ProductCard productId="1" />);
    });

    expect(screen.getByTestId("product-title")).toHaveTextContent(
      "Test Product"
    );
    expect(screen.getByTestId("product-description")).toHaveTextContent(
      "This is a test product"
    );
    expect(screen.getByTestId("product-price")).toHaveTextContent("$100");
    expect(screen.getByTestId("product-average-rating")).toHaveTextContent(
      "4.5 ★"
    );
  });

  it("should display error message if fetching product fails", async () => {
    (fetch as jest.Mock).mockImplementation(() =>
      Promise.reject(new Error("Failed to fetch product"))
    );

    await act(async () => {
      renderWithUserProvider(<ProductCard productId="1" />);
    });

    expect(
      screen.getByText("Error: Failed to fetch product")
    ).toBeInTheDocument();
  });

  it("should toggle reviews visibility", async () => {
    (fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/api/products/1")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              id: "1",
              title: "Test Product",
              description: "This is a test product",
              price: 100,
              average_rating: 4.5,
              reviews: [],
            }),
        });
      }
      if (url.includes("/api/products/1/reviews")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve([
              { id: "r1", content: "Great product", rating: 5 },
              { id: "r2", content: "Good value", rating: 4 },
            ]),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    await act(async () => {
      renderWithUserProvider(<ProductCard productId="1" />);
    });

    const toggleButton = screen.getByTestId("toggle-reviews-button");

    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent("Show Reviews");

    // Show reviews
    await act(async () => {
      toggleButton.click();
    });
    expect(toggleButton).toHaveTextContent("Hide Reviews");

    // Hide reviews
    await act(async () => {
      toggleButton.click();
    });
    expect(toggleButton).toHaveTextContent("Show Reviews");
  });
});
