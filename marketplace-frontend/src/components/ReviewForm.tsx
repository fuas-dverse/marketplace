"use client";

import { useState } from "react";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm(props: ReviewFormProps) {
  const [rating, setRating] = useState("");
  const [content, setContent] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const productId = props.productId;

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`).then((res) =>
        res.json()
      );
      setProduct(res.product);
      console.log(res);
    } catch (error: Error | any) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchProduct();
    const reviewData = {
      rating: parseFloat(rating),
      content,
      product_id: productId,
      user_id: sellerId,
    };

    console.log("Review Data Submitted:", reviewData);

    const reviewResponse = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    }).then((res) => res.json());

    console.log(reviewResponse);

    // Clear the form fields after submission
    setRating("");
    setContent("");
    setSellerId("");
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4"
      data-testid="review-form"
    >
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
          data-testid="input-rating"
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
          data-testid="input-content"
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
          data-testid="input-sellerId"
        />
      </div>

      <button
        type="submit"
        className="bg-purple-900 text-white p-2 mt-4 rounded"
        data-testid="submit-review-button"
      >
        Submit Review
      </button>
    </form>
  );
}
