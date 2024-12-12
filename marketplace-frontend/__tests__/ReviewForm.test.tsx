import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReviewFormModal from "@/components/ReviewForm";
import { renderWithUserProvider } from "./utils/renderWithProvider";

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: "Review submitted successfully" }),
  })
) as jest.Mock;

describe("ReviewFormModal Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the 'Add Review' button", () => {
    renderWithUserProvider(<ReviewFormModal productId="1" />);
    const button = screen.getByTestId("add-review-button");
    expect(button).toBeInTheDocument();
  });

  it("opens the modal when the 'Add Review' button is clicked", async () => {
    renderWithUserProvider(<ReviewFormModal productId="1" />);
    const button = screen.getByTestId("add-review-button");
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByTestId("review-form")).toBeInTheDocument();
  });

  it("allows the user to fill out the form and submit a review", async () => {
    renderWithUserProvider(<ReviewFormModal productId="1" />);
    fireEvent.click(screen.getByTestId("add-review-button"));

    fireEvent.change(screen.getByTestId("input-rating"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByTestId("input-content"), {
      target: { value: "This is a great product!" },
    });

    fireEvent.click(screen.getByTestId("submit-review-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/products/1/reviews",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: 5,
            content: "This is a great product!",
            product_id: "1",
            user_id: "user123",
          }),
        })
      );
    });
  });

  it("closes the modal when the 'Add Review' button is toggled", () => {
    renderWithUserProvider(<ReviewFormModal productId="1" />);
    const button = screen.getByTestId("add-review-button");
    fireEvent.click(button);

    const closeButton = screen.getByTestId("close-modal"); // Assuming the modal has a close button with this label
    fireEvent.click(closeButton);

    expect(screen.queryByTestId("review-form")).not.toBeInTheDocument();
  });
});
