import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import Transaction from "@/components/Transaction";

// Mock the fetch API
global.fetch = jest.fn((url) => {
  if (url.includes("/api/products/")) {
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          id: 1,
          title: "Test Product",
          description: "This is a test product",
          price: 100,
          average_rating: 4,
          rating_count: 1,
          seller_id: 1,
        }),
    });
  } else if (url.includes("/api/transactions/")) {
    return Promise.resolve({
      json: () => Promise.resolve({ message: "Transaction complete" }),
    });
  }
  return Promise.reject(new Error("Unknown URL"));
}) as jest.Mock;

describe("Transaction Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the loading state initially", () => {
    render(<Transaction productId="1" />);
    expect(screen.getByTestId("transaction-loading")).toBeInTheDocument();
  });

  it("should render the product details after fetching", async () => {
    await act(async () => {
      render(<Transaction productId="1" />);
    });

    await waitFor(() =>
      expect(
        screen.queryByTestId("transaction-loading")
      ).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("transaction-title")).toHaveTextContent(
      "Test Product"
    );
    expect(screen.getByTestId("transaction-description")).toHaveTextContent(
      "This is a test product"
    );
    expect(screen.getByTestId("transaction-price")).toHaveTextContent(
      "Price: $100"
    );
  });

  it("should handle a successful purchase", async () => {
    await act(async () => {
      render(<Transaction productId="1" />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("transaction-title")).toHaveTextContent(
        "Test Product"
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("transaction-button"));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "complete",
            product_id: 1,
            buyer_id: 1,
          }),
        })
      );
    });
  });

  // it("should handle a failed purchase", async () => {
  //   (fetch as jest.Mock).mockImplementationOnce(() =>
  //     Promise.resolve({
  //       json: () =>
  //         Promise.resolve({
  //           error: "Transaction failed",
  //         }),
  //     })
  //   );

  //   await act(async () => {
  //     render(<Transaction productId="1" />);
  //   });

  //   await waitFor(() => {
  //     expect(screen.getByTestId("transaction-title")).toHaveTextContent(
  //       "Test Product"
  //     );
  //   });

  //   await act(async () => {
  //     fireEvent.click(screen.getByTestId("transaction-button"));
  //   });

  //   await waitFor(() => {
  //     expect(
  //       screen.getByTestId("transaction-status-message")
  //     ).toHaveTextContent("Transaction failed");
  //   });
  // });
});
