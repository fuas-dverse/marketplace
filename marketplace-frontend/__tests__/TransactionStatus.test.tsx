import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransactionStatus from "@/components/TransactionStatus";

describe("TransactionStatus Component Tests", () => {
  it("should display the correct message for a complete transaction", () => {
    render(<TransactionStatus status="complete" />);

    expect(
      screen.getByTestId("transaction-status-container")
    ).toBeInTheDocument();
    expect(screen.getByTestId("transaction-status-title")).toHaveTextContent(
      "Transaction Complete"
    );
    expect(screen.getByTestId("transaction-status-text")).toHaveTextContent(
      "Thank you for your purchase! Your transaction was successful."
    );
  });

  it("should display the correct message for a pending transaction", () => {
    render(<TransactionStatus status="pending" />);

    expect(
      screen.getByTestId("transaction-status-container")
    ).toBeInTheDocument();
    expect(screen.getByTestId("transaction-status-title")).toHaveTextContent(
      "Transaction Pending"
    );
    expect(screen.getByTestId("transaction-status-text")).toHaveTextContent(
      "Your transaction is currently being processed. Please check back later."
    );
  });

  it("should display the correct message for a failed transaction", () => {
    render(<TransactionStatus status="failed" />);

    expect(
      screen.getByTestId("transaction-status-container")
    ).toBeInTheDocument();
    expect(screen.getByTestId("transaction-status-title")).toHaveTextContent(
      "Transaction Failed"
    );
    expect(screen.getByTestId("transaction-status-text")).toHaveTextContent(
      "There was an issue with your transaction. Please try again."
    );
  });

  it("should display the correct message for an unknown status", () => {
    render(<TransactionStatus status={"unknown" as any} />);

    expect(
      screen.getByTestId("transaction-status-container")
    ).toBeInTheDocument();
    expect(screen.getByTestId("transaction-status-title")).toHaveTextContent(
      "Unknown Status"
    );
    expect(screen.getByTestId("transaction-status-text")).toHaveTextContent(
      "Transaction status is unknown. Please contact support."
    );
  });
});
