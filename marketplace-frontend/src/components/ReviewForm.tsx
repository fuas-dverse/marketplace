"use client";

import { useState } from "react";

export default function ProductForm() {
  const [rating, setRating] = useState("");
  const [content, setContent] = useState("");
  const [productId, setProductId] = useState("");
  const [sellerId, setSellerId] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const reviewData = {
      rating: parseFloat(rating),
      content,
      product_id: parseInt(productId),
      seller_id: parseInt(sellerId),
    };

    console.log("Review Data Submitted:", reviewData);

    const res = await fetch(
      `${window.location.origin}/api/products/${productId}/reviews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      }
    ).then((res) => res.json());

    console.log(res);

    // Clear the form fields after submission
    setRating("");
    setContent("");
    setProductId("");
    setSellerId("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label htmlFor="rating" className="block">
          Rating:
        </label>
        <input
          type="number"
          id="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          required
          className="border border-gray-300 p-2 w-full"
        />
      </div>

      <div>
        <label htmlFor="content" className="block">
          Content:
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="border border-gray-300 p-2 w-full"
        />
      </div>

      <div>
        <label htmlFor="productId" className="block">
          Product ID:
        </label>
        <input
          type="number"
          id="productId"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          className="border border-gray-300 p-2 w-full"
        />
      </div>

      <div>
        <label htmlFor="sellerId" className="block">
          Seller ID:
        </label>
        <input
          type="number"
          id="sellerId"
          value={sellerId}
          onChange={(e) => setSellerId(e.target.value)}
          required
          className="border border-gray-300 p-2 w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-purple-900 text-white p-2 mt-4 rounded"
      >
        Submit Review
      </button>
    </form>
  );
}
