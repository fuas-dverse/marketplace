import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "@/components/Header";

describe("Header Component Tests", () => {
  it("should render the header component", () => {
    render(<Header />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("should render the title with correct text", () => {
    render(<Header />);
    expect(screen.getByTestId("header-title")).toHaveTextContent("Marketplace");
  });

  it("should render the navigation links", () => {
    render(<Header />);
    expect(screen.getByTestId("header-nav-link-home")).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByTestId("header-nav-link-home")).toHaveTextContent(
      "Home"
    );
    expect(screen.getByTestId("header-nav-link-transactions")).toHaveAttribute(
      "href",
      "/transactions"
    );
    expect(
      screen.getByTestId("header-nav-link-transactions")
    ).toHaveTextContent("Transactions");
  });

  it("should render the navigation container", () => {
    render(<Header />);
    expect(screen.getByTestId("header-nav-container")).toBeInTheDocument();
  });
});
