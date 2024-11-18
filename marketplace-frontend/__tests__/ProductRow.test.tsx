import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProductRow } from "@/components/ProductRow";
import { Product } from "@/types/marketplace.types";

const mockProduct: Product = {
  id: "1",
  title: "Test Product",
  description:
    "This is a test product description. It is meant to be descriptive and informative.",
  price: "99.99",
};

describe("ProductRow Component Tests", () => {
  it("should render the ProductRow component with product details", () => {
    render(<ProductRow {...mockProduct} />);

    // Check if all product details are rendered
    expect(screen.getByTestId("product-container")).toBeInTheDocument();
    expect(screen.getByTestId("product-image")).toBeInTheDocument();
    expect(screen.getByTestId("product-title")).toHaveTextContent(
      mockProduct.title
    );
    expect(screen.getByTestId("product-description")).toHaveTextContent(
      mockProduct.description
    );
    expect(screen.getByTestId("product-price")).toHaveTextContent(
      `$${mockProduct.price}`
    );
  });

  it("should render a link to the product details page", () => {
    render(<ProductRow {...mockProduct} />);
    const productLink = screen.getByTestId("product-link");
    expect(productLink).toHaveAttribute("href", `/products/${mockProduct.id}`);
  });

  it("should render a link to buy the product", () => {
    render(<ProductRow {...mockProduct} />);
    const buyLink = screen.getByTestId("product-buy-link");
    expect(buyLink).toHaveAttribute("href", `/products/${mockProduct.id}/buy`);
  });

  it("should render a Buy Now button", () => {
    render(<ProductRow {...mockProduct} />);
    const buyButton = screen.getByTestId("product-button");
    expect(buyButton).toBeInTheDocument();
    expect(buyButton).toHaveTextContent("Buy Now");
  });
});
