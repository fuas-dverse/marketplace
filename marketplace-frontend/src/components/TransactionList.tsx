"use client";

import React, { useEffect, useState } from "react";

interface Transaction {
  buyer_id: number;
  status: "complete" | "pending" | "failed" | "";
  product_id: number;
  id: number;
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("api/transactions").then((res) =>
        res.json()
      );
      setTransactions(response);
    } catch (err: Error | any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p data-testid="transaction-list-loading">Loading...</p>;
  if (error)
    return (
      <p className="text-red-500" data-testid="transaction-list-error">
        {error}
      </p>
    );

  const transactionRow = (transaction: Transaction) => (
    <tr
      key={transaction.id}
      className="hover:bg-gray-50"
      data-testid={`transaction-row-${transaction.id}`}
    >
      <td
        className="border px-4 py-2"
        data-testid={`transaction-id-${transaction.id}`}
      >
        {transaction.id}
      </td>
      <td
        className="border px-4 py-2"
        data-testid={`transaction-buyer-${transaction.buyer_id}`}
      >
        {transaction.buyer_id}
      </td>
      <td
        className="border px-4 py-2"
        data-testid={`transaction-product-${transaction.product_id}`}
      >
        {transaction.product_id}
      </td>
      <td
        className="border px-4 py-2"
        data-testid={`transaction-status-${transaction.status}`}
      >
        <span
          className={`inline-block px-2 py-1 rounded-md text-white ${
            transaction.status === "complete"
              ? "bg-green-500"
              : transaction.status === ""
              ? "bg-gray-500"
              : "bg-red-500"
          }`}
        >
          {transaction.status || "pending"}
        </span>
      </td>
    </tr>
  );

  return (
    <div
      className="container mx-auto p-4"
      data-testid="transaction-list-container"
    >
      <h2
        className="text-2xl font-bold mb-4"
        data-testid="transaction-list-title"
      >
        Transaction History
      </h2>
      {!transactions || transactions.length === 0 ? (
        <p className="text-gray-600" data-testid="no-transactions-message">
          No transactions found.
        </p>
      ) : (
        <table
          className="min-w-full border border-gray-300"
          data-testid="transaction-list-table"
        >
          <thead data-testid="transaction-list-table-header">
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Transaction ID</th>
              <th className="border px-4 py-2 text-left">Buyer ID</th>
              <th className="border px-4 py-2 text-left">Product ID</th>
              <th className="border px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody data-testid="transaction-list-table-body">
            {transactions &&
              transactions.length > 0 &&
              transactions.map(
                (transaction) => transaction && transactionRow(transaction)
              )}
          </tbody>
        </table>
      )}
    </div>
  );
}
