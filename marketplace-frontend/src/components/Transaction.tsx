"use client";

import { useEffect, useState } from "react";
import TransactionStatus from "./TransactionStatus";
import { UserContext, useUser } from "@/contexts/UserProvider";
import { Product } from "@/types/marketplace.types";

interface TransactionModalProps {
  productId: string;
  onClose: () => void;
}

export default function TransactionModal({
  productId,
  onClose,
}: TransactionModalProps) {
  const [status, setStatus] = useState<
    "complete" | "pending" | "failed" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  // @ts-expect-error - Add types for user, loading, and error
  const { user } = useUser(UserContext);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`).then((res) =>
        res.json()
      );
      setProduct(res);
    } catch (error: Error | any) {
      setError(error.message);
    }
  };

  if (!product) {
    return null;
  }
  const handlePurchase = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setError("You must be logged in to make a purchase.");
      return;
    }

    const transactionData = {
      status: "complete",
      product_id: product.id,
      buyer_id: user?.id,
      amount: product.price,
    };

    try {
      const res = await fetch(`/api/transactions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        setStatus("failed");
        setError("Transaction failed. Please try again.");
        return;
      }

      setStatus("complete");
    } catch (err: any) {
      setStatus("failed");
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
          data-testid="close-transaction-modal"
        >
          ✕
        </button>

        {status ? (
          <TransactionStatus status={status} />
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-purple-800 mb-4">
              {product.title}
            </h2>
            <p className="text-gray-700">{product.description}</p>
            <p className="text-lg font-semibold text-green-700 my-4">
              Price: ${product.price}
            </p>
            {error && (
              <p
                className="text-red-500 text-sm mb-4"
                data-testid="error-message"
              >
                {error}
              </p>
            )}
            <form onSubmit={handlePurchase}>
              <button
                type="submit"
                className="bg-purple-900 text-white px-6 py-3 rounded-lg shadow-md hover:bg-purple-800 transition w-full"
                data-testid="confirm-purchase-button"
              >
                Confirm Purchase
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
