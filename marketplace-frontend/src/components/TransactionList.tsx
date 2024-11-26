"use client";

import { Product } from "@/types/marketplace.types";
import React, { useEffect, useState } from "react";

interface Transaction {
  buyer_id: string;
  status: "complete" | "completed" | "pending" | "failed" | "" | "cancelled";
  product_id: string;
  id: string;
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const response = await fetch("api/products").then((res) => res.json());
      setProducts(response);
    } catch (err: Error | any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProductTitle = (productId: string) => {
    if (!products) return "Loading...";
    const product = products.find((product) => product.id === productId);
    return product ? product.title : "Product not found";
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        <p className="text-gray-600 text-lg ml-4">Loading transactions...</p>
      </div>
    );

  if (error)
    return (
      <p
        className="text-red-500 text-center mt-4"
        data-testid="transaction-list-error"
      >
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
        className="border px-4 py-3"
        data-testid={`transaction-product-${transaction.product_id}`}
      >
        {getProductTitle(transaction.product_id)}
      </td>
      <td
        className="border px-4 py-3"
        data-testid={`transaction-status-${transaction.status}`}
      >
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
            transaction.status === "complete" ||
            transaction.status === "completed"
              ? "bg-green-100 text-green-700"
              : transaction.status === "" || transaction.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : transaction.status === "failed" ||
                transaction.status === "cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {transaction.status || "Pending"}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="container mx-auto px-6 py-8 bg-white shadow-md rounded-md">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
        Transaction History
      </h2>
      {!transactions || transactions.length === 0 ? (
        <p
          className="text-gray-600 text-center"
          data-testid="no-transactions-message"
        >
          No transactions found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="min-w-full bg-white border border-gray-200 text-left"
            data-testid="transaction-list-table"
          >
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border px-4 py-2 text-sm font-semibold tracking-wide">
                  Product
                </th>
                <th className="border px-4 py-2 text-sm font-semibold tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions &&
                transactions.length > 0 &&
                transactions.map(
                  (transaction) => transaction && transactionRow(transaction)
                )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
