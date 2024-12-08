import { render, screen, fireEvent } from "@testing-library/react";
import { ProductRow } from "@/components/ProductRow";
import { Product } from "@/types/marketplace.types";

describe("ProductRow Component", () => {
  const mockProduct: Product & { onBuyNow: () => void } = {
    id: "1",
    title: "Test Product",
    description: "This is a test product description.",
    price: "99.99",
    onBuyNow: jest.fn(), // Mock the onBuyNow callback
  };

  it("renders the product container", () => {
    render(<ProductRow {...mockProduct} />);

    const container = screen.getByTestId("product-container");
    expect(container).toBeInTheDocument();
  });

  it("displays the product image", () => {
    render(<ProductRow {...mockProduct} />);

    const image = screen.getByTestId("product-image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://picsum.photos/600/450");
    expect(image).toHaveAttribute("alt", "Product Image");
  });

  it("displays the product title", () => {
    render(<ProductRow {...mockProduct} />);

    const title = screen.getByTestId("product-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent(mockProduct.title);
  });

  it("displays the product description", () => {
    render(<ProductRow {...mockProduct} />);

    const description = screen.getByTestId("product-description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent(mockProduct.description);
  });

  it("displays the product price", () => {
    render(<ProductRow {...mockProduct} />);

    const price = screen.getByTestId("product-price");
    expect(price).toBeInTheDocument();
    expect(price).toHaveTextContent(`$${mockProduct.price}`);
  });

  it("calls the onBuyNow function when 'Buy Now' button is clicked", () => {
    render(<ProductRow {...mockProduct} />);

    const buyNowButton = screen.getByTestId("product-buy-button");
    expect(buyNowButton).toBeInTheDocument();

    // Simulate clicking the "Buy Now" button
    fireEvent.click(buyNowButton);
    expect(mockProduct.onBuyNow).toHaveBeenCalledTimes(1);
  });
});
