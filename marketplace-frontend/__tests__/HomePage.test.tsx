import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import HomePage from "@/app/page";

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

describe("HomePage Component Tests", () => {
  it("should render the HomePage component with ProductList", async () => {
    await act(async () => {
      render(<HomePage />);
    });
    const productListContainer = screen.getByTestId("product-list-container");
    expect(productListContainer).toBeInTheDocument();
  });
});
