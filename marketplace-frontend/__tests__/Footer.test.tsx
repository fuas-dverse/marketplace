import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "@/components/Footer";

describe("Footer Component Tests", () => {
  it("should render the footer container", () => {
    render(<Footer />);
    expect(screen.getByTestId("footer-container")).toBeInTheDocument();
  });

  it("should render the logo with correct text", () => {
    render(<Footer />);
    expect(screen.getByTestId("footer-logo")).toHaveTextContent("Marketplace");
  });

  it("should render the copyright information", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByTestId("footer-copyright")).toHaveTextContent(
      `© ${currentYear} Marketplace. All rights reserved.`
    );
  });

  it("should render the navigation links", () => {
    render(<Footer />);
    expect(screen.getByTestId("footer-link-about")).toHaveAttribute(
      "href",
      "/about"
    );
    expect(screen.getByTestId("footer-link-contact")).toHaveAttribute(
      "href",
      "/contact"
    );
    expect(screen.getByTestId("footer-link-privacy")).toHaveAttribute(
      "href",
      "/privacy-policy"
    );
    expect(screen.getByTestId("footer-link-terms")).toHaveAttribute(
      "href",
      "/terms"
    );
  });

  it("should render the social media links", () => {
    render(<Footer />);
    expect(screen.getByTestId("footer-link-twitter")).toHaveAttribute(
      "href",
      "https://twitter.com"
    );
    expect(screen.getByTestId("footer-link-facebook")).toHaveAttribute(
      "href",
      "https://facebook.com"
    );
    expect(screen.getByTestId("footer-link-instagram")).toHaveAttribute(
      "href",
      "https://instagram.com"
    );
  });
});
