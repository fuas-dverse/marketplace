import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductForm from "@/components/ProductForm";

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: "Product created successfully" }),
  })
) as jest.Mock;

describe("ProductForm Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the ProductForm component with all fields", () => {
    render(<ProductForm />);
    expect(screen.getByTestId("input-title")).toBeInTheDocument();
    expect(screen.getByTestId("input-description")).toBeInTheDocument();
    expect(screen.getByTestId("input-price")).toBeInTheDocument();
    expect(screen.getByTestId("input-sellerId")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  it("should allow user to fill out the form fields", () => {
    render(<ProductForm />);
    fireEvent.change(screen.getByTestId("input-title"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByTestId("input-description"), {
      target: { value: "This is a test product" },
    });
    fireEvent.change(screen.getByTestId("input-price"), {
      target: { value: 100 },
    });
    fireEvent.change(screen.getByTestId("input-sellerId"), {
      target: { value: 1 },
    });

    expect(screen.getByTestId("input-title")).toHaveValue("Test Product");
    expect(screen.getByTestId("input-description")).toHaveValue(
      "This is a test product"
    );
    expect(screen.getByTestId("input-price")).toHaveValue(100);
    expect(screen.getByTestId("input-sellerId")).toHaveValue(1);
  });

  it("should submit the form and clear the fields", async () => {
    render(<ProductForm />);
    fireEvent.change(screen.getByTestId("input-title"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByTestId("input-description"), {
      target: { value: "This is a test product" },
    });
    fireEvent.change(screen.getByTestId("input-price"), {
      target: { value: 100 },
    });
    fireEvent.change(screen.getByTestId("input-sellerId"), {
      target: { value: 1 },
    });

    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Test Product",
            description: "This is a test product",
            price: 100,
            seller_id: 1,
          }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("input-title")).toHaveValue("");
      expect(screen.getByTestId("input-description")).toHaveValue("");
      expect(screen.getByTestId("input-price")).toHaveValue(null);
      expect(screen.getByTestId("input-sellerId")).toHaveValue(null);
    });
  });

  it("should display an error if the fetch fails", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Failed to create product"))
    );

    render(<ProductForm />);
    fireEvent.change(screen.getByTestId("input-title"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByTestId("input-description"), {
      target: { value: "This is a test product" },
    });
    fireEvent.change(screen.getByTestId("input-price"), {
      target: { value: 100 },
    });
    fireEvent.change(screen.getByTestId("input-sellerId"), {
      target: { value: 1 },
    });

    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(
        screen.getByText("Error: Failed to create product")
      ).toBeInTheDocument();
    });
  });
});
