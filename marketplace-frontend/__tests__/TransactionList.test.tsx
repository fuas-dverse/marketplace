import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransactionList from "@/components/TransactionList";

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        { id: 1, buyer_id: 101, status: "complete", product_id: 501 },
        { id: 2, buyer_id: 102, status: "failed", product_id: 502 },
      ]),
  })
) as jest.Mock;

describe("TransactionList Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the loading state initially", async () => {
    render(<TransactionList />);
    expect(screen.getByTestId("transaction-list-loading")).toBeInTheDocument();
  });

  it("should render the transaction list after fetching", async () => {
    await act(async () => {
      render(<TransactionList />);
    });

    await waitFor(() =>
      expect(
        screen.queryByTestId("transaction-list-loading")
      ).not.toBeInTheDocument()
    );
    expect(
      screen.getByTestId("transaction-list-container")
    ).toBeInTheDocument();
    expect(screen.getByTestId("transaction-list-title")).toHaveTextContent(
      "Transaction History"
    );
    expect(screen.getByTestId("transaction-list-table")).toBeInTheDocument();

    // Check that each transaction row is rendered
    expect(screen.getByTestId("transaction-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("transaction-id-1")).toHaveTextContent("1");
    expect(screen.getByTestId("transaction-buyer-101")).toHaveTextContent(
      "101"
    );
    expect(screen.getByTestId("transaction-product-501")).toHaveTextContent(
      "501"
    );
    expect(
      screen.getByTestId("transaction-status-complete")
    ).toBeInTheDocument();

    expect(screen.getByTestId("transaction-row-2")).toBeInTheDocument();
    expect(screen.getByTestId("transaction-id-2")).toHaveTextContent("2");
    expect(screen.getByTestId("transaction-buyer-102")).toHaveTextContent(
      "102"
    );
    expect(screen.getByTestId("transaction-product-502")).toHaveTextContent(
      "502"
    );
    expect(screen.getByTestId("transaction-status-failed")).toBeInTheDocument();
  });

  it("should render an error message if fetching transactions fails", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Failed to fetch transactions"))
    );

    await act(async () => {
      render(<TransactionList />);
    });

    await waitFor(() =>
      expect(
        screen.queryByTestId("transaction-list-loading")
      ).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("transaction-list-error")).toHaveTextContent(
      "Failed to fetch transactions"
    );
  });

  it("should render a message if no transactions are found", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve([]) })
    );

    await act(async () => {
      render(<TransactionList />);
    });

    await waitFor(() =>
      expect(
        screen.queryByTestId("transaction-list-loading")
      ).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("no-transactions-message")).toHaveTextContent(
      "No transactions found."
    );
  });
});
