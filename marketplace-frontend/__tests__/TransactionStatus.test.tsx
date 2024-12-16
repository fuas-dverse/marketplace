import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransactionList from "@/components/TransactionList";
import { renderWithUserProvider } from "./utils/renderWithProvider";

// Mock fetch API
global.fetch = jest.fn((url) => {
  if (url.includes("api/transactions")) {
    return Promise.resolve({
      json: () =>
        Promise.resolve([
          {
            id: "1",
            buyer_id: "user1",
            product_id: "prod1",
            status: "complete",
          },
          { id: "2", buyer_id: "user2", product_id: "prod2", status: "failed" },
        ]),
    });
  } else if (url.includes("api/products")) {
    return Promise.resolve({
      json: () =>
        Promise.resolve([
          { id: "prod1", title: "Product 1" },
          { id: "prod2", title: "Product 2" },
        ]),
    });
  }
  return Promise.reject(new Error("Unknown URL"));
}) as jest.Mock;

describe("TransactionList Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders transaction rows after fetching data", async () => {
    await act(async () => {
      renderWithUserProvider(<TransactionList />);
    });

    await waitFor(() => {
      const table = screen.getByTestId("transaction-list-table");
      expect(table).toBeInTheDocument();
    });

    expect(screen.getByTestId("transaction-product-prod1")).toHaveTextContent(
      "Product 1"
    );
    expect(screen.getByTestId("transaction-status-complete")).toHaveTextContent(
      "complete"
    );

    expect(screen.getByTestId("transaction-product-prod2")).toHaveTextContent(
      "Product 2"
    );
    expect(screen.getByTestId("transaction-status-failed")).toHaveTextContent(
      "failed"
    );
  });

  it("displays an error message if fetching transactions fails", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Failed to fetch transactions"))
    );

    await act(async () => {
      renderWithUserProvider(<TransactionList />);
    });

    await waitFor(() => {
      const errorMessage = screen.getByTestId("transaction-list-error");
      expect(errorMessage).toHaveTextContent("Failed to fetch transactions");
    });
  });

  it("renders a message if no transactions are found", async () => {
    (fetch as jest.Mock).mockImplementationOnce((url) => {
      if (url.includes("api/transactions")) {
        return Promise.resolve({ json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    await act(async () => {
      renderWithUserProvider(<TransactionList />);
    });

    await waitFor(() => {
      const noTransactionsMessage = screen.getByTestId(
        "no-transactions-message"
      );
      expect(noTransactionsMessage).toHaveTextContent("No transactions found.");
    });
  });

  it("displays 'Product not found' if a product ID does not match", async () => {
    (fetch as jest.Mock).mockImplementationOnce((url) => {
      if (url.includes("api/transactions")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve([
              {
                id: "1",
                buyer_id: "user1",
                product_id: "unknown",
                status: "pending",
              },
            ]),
        });
      }
      if (url.includes("api/products")) {
        return Promise.resolve({ json: () => Promise.resolve([]) });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    await act(async () => {
      renderWithUserProvider(<TransactionList />);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("transaction-product-unknown")
      ).toHaveTextContent("Product not found");
    });
  });
});
