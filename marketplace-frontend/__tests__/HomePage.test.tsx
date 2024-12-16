import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import HomePage from "@/app/page";
import { createMockResponse, productsResponse } from "./utils/mockFetch";

global.fetch = jest
  .fn()
  .mockResolvedValue(createMockResponse({ data: productsResponse }));

describe("HomePage Component Tests", () => {
  it("should render the HomePage component with ProductList", async () => {
    await act(async () => {
      render(<HomePage />);
    });
    const productListContainer = screen.getByTestId("product-list-container");
    expect(productListContainer).toBeInTheDocument();
  });
});
