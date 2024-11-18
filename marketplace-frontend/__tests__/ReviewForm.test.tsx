import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReviewForm from "@/components/ReviewForm";

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: "Review submitted successfully" }),
  })
) as jest.Mock;

describe("ReviewForm Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the ReviewForm component with all fields", () => {
    render(<ReviewForm productId={"1"} />);
    expect(screen.getByTestId("input-rating")).toBeInTheDocument();
    expect(screen.getByTestId("input-content")).toBeInTheDocument();
    expect(screen.getByTestId("input-sellerId")).toBeInTheDocument();
    expect(screen.getByTestId("submit-review-button")).toBeInTheDocument();
  });

  it("should allow user to fill out the form fields", () => {
    render(<ReviewForm productId="1" />);
    fireEvent.change(screen.getByTestId("input-rating"), {
      target: { value: 5 },
    });
    fireEvent.change(screen.getByTestId("input-content"), {
      target: { value: "Great product!" },
    });
    fireEvent.change(screen.getByTestId("input-sellerId"), {
      target: { value: 2 },
    });

    expect(screen.getByTestId("input-rating")).toHaveValue(5);
    expect(screen.getByTestId("input-content")).toHaveValue("Great product!");
    expect(screen.getByTestId("input-sellerId")).toHaveValue(2);
  });

  it("should submit the form and clear the fields", async () => {
    render(<ReviewForm productId="1" />);
    fireEvent.change(screen.getByTestId("input-rating"), {
      target: { value: 5 },
    });
    fireEvent.change(screen.getByTestId("input-content"), {
      target: { value: "Great product!" },
    });
    fireEvent.change(screen.getByTestId("input-sellerId"), {
      target: { value: 2 },
    });

    fireEvent.click(screen.getByTestId("submit-review-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: 5,
            content: "Great product!",
            product_id: 1,
            user_id: 2,
          }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("input-rating")).toHaveValue(null);
      expect(screen.getByTestId("input-content")).toHaveValue("");
      expect(screen.getByTestId("input-sellerId")).toHaveValue(null);
    });
  });

  it("should display an error if the fetch fails", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Failed to submit review"))
    );

    render(<ReviewForm productId="1" />);
    fireEvent.change(screen.getByTestId("input-rating"), {
      target: { value: 5 },
    });
    fireEvent.change(screen.getByTestId("input-content"), {
      target: { value: "Great product!" },
    });
    fireEvent.change(screen.getByTestId("input-sellerId"), {
      target: { value: 2 },
    });

    fireEvent.click(screen.getByTestId("submit-review-button"));

    await waitFor(() => {
      expect(
        screen.getByText("Error: Failed to submit review")
      ).toBeInTheDocument();
    });
  });
});
