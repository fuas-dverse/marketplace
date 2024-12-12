import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductForm from "@/components/ProductForm";
import {
  renderWithNullUserProvider,
  renderWithUserProvider,
} from "./utils/renderWithProvider";

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ message: "Product created successfully" }),
  })
) as jest.Mock;

describe("ProductForm Component Tests", () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the ProductForm component with all fields", () => {
    renderWithUserProvider(<ProductForm onSuccess={mockOnSuccess} />);
    expect(screen.getByTestId("input-title")).toBeInTheDocument();
    expect(screen.getByTestId("input-description")).toBeInTheDocument();
    expect(screen.getByTestId("input-price")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  it("should allow user to fill out the form fields", () => {
    renderWithUserProvider(<ProductForm onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByTestId("input-title"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByTestId("input-description"), {
      target: { value: "This is a test product" },
    });
    fireEvent.change(screen.getByTestId("input-price"), {
      target: { value: 100 },
    });

    expect(screen.getByTestId("input-title")).toHaveValue("Test Product");
    expect(screen.getByTestId("input-description")).toHaveValue(
      "This is a test product"
    );
    expect(screen.getByTestId("input-price")).toHaveValue(100);
  });

  it("should display a success message after form submission", async () => {
    renderWithUserProvider(<ProductForm onSuccess={mockOnSuccess} />);
    await act(async () => {
      fireEvent.change(screen.getByTestId("input-title"), {
        target: { value: "Test Product" },
      });
      fireEvent.change(screen.getByTestId("input-description"), {
        target: { value: "This is a test product" },
      });
      fireEvent.change(screen.getByTestId("input-price"), {
        target: { value: 100 },
      });

      fireEvent.click(screen.getByTestId("submit-button"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("success-message")).toBeInTheDocument();
    });
  });
});
