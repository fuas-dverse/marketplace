"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TransactionStatus from "./TransactionStatus";

interface TransactionProps {
  productId: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  average_rating: number;
}

export default function Transaction(props: TransactionProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<
    "complete" | "pending" | "failed" | null
  >(null);

  const productId = props.productId;

  useEffect(() => {
    fetchProduct();
    console.log("Product:", product);
  }, [productId]);

  const fetchProduct = async () => {
    if (productId) {
      const res = await fetch(`/api/products/${productId}`).then((res) =>
        res.json()
      );
      console.log(res);
      setProduct(res.product);
    }
  };

  const handlePurchase = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const transactionData = {
      status: "complete",
      product_id: parseInt(productId),
      buyer_id: 1,
    };

    const res = await fetch(`${window.location.origin}/api/transactions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    }).then((res) => res.json());

    if (res.error) {
      setStatus("failed");
      return;
    }

    setStatus("complete");

    console.log("Purchase complete:", res);
  };

  if (!product) return <div>Loading...</div>;

  return (
    <>
      {status ? (
        <TransactionStatus status={status} />
      ) : (
        <div className="container mx-auto p-4">
          <h2 className="text-3xl font-bold text-purple-800 mb-4">
            {product.title}
          </h2>
          <p className="text-lg mb-2">{product.description}</p>
          <p className="text-xl font-semibold">Price: ${product.price}</p>
          <form onSubmit={handlePurchase} className="mt-4">
            <button
              type="submit"
              className="bg-purple-950 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition"
            >
              Confirm Purchase
            </button>
          </form>
        </div>
      )}
    </>
  );
}
