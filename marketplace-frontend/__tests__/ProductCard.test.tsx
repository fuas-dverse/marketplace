import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductCard from "@/components/ProductCard";
import "whatwg-fetch"; // Polyfill for fetch

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        product: {
          id: 1,
          title: "Test Product",
          description: "This is a test product",
          price: 100,
          average_rating: 4.5,
          reviews: [],
        },
      }),
  })
) as jest.Mock;

describe("ProductCard Component Tests", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/api/products/")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              product: {
                id: 1,
                title: "Test Product",
                description: "This is a test product",
                price: 100,
                average_rating: 4.5,
                reviews: [],
              },
            }),
        });
      } else if (url.includes("/api/products/1/reviews")) {
        return Promise.resolve({
          json: () => Promise.resolve({ reviews: [] }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });
  });

  it("should render the ProductCard component with product details", async () => {
    await act(async () => {
      render(<ProductCard productId="1" />);
    });
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("This is a test product")).toBeInTheDocument();
    expect(screen.getByText("Price: $100")).toBeInTheDocument();
    expect(screen.getByText("Average Rating: 4.5 ★")).toBeInTheDocument();
  });

  it("should display error message if fetching product fails", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Failed to fetch product"))
    );
    await act(async () => {
      render(<ProductCard productId="1" />);
    });
    expect(
      screen.getByText("Error: Failed to fetch product")
    ).toBeInTheDocument();
  });

  it("should toggle reviews visibility", async () => {
    await act(async () => {
      render(<ProductCard productId="1" />);
    });
    const toggleButton = screen.getByRole("button", { name: /show reviews/i });
    expect(toggleButton).toBeInTheDocument();
    await act(async () => {
      toggleButton.click();
    });
    expect(
      screen.getByRole("button", { name: /hide reviews/i })
    ).toBeInTheDocument();
  });
});
