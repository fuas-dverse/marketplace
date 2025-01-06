"use client";

import { useEffect, useState } from "react";
import ReviewList from "./ReviewList";
import ReviewFormModal from "./ReviewForm";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  average_rating: number;
  reviews: Review[];
}

interface Review {
  id: string;
  content: string;
  rating: number;
}

interface ProductCardProps {
  productId: string;
}

export default function ProductCard(props: ProductCardProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReviewsVisible, setIsReviewsVisible] = useState<boolean>(false);
  const { productId } = props;

  useEffect(() => {
    fetchProduct();
    fetchReviews();
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

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`).then(
        (res) => res.json()
      );
      setProduct((prev) => (prev ? { ...prev, reviews: res } : null));
    } catch (error: Error | any) {
      setError(error.message);
    }
  };

  const toggleReviews = () => {
    setIsReviewsVisible((prev) => !prev);
  };

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!product)
    return (
      <div className="text-center text-gray-600 text-lg mt-8">Loading...</div>
    );

  return (
    <div
      className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-8"
      data-testid="product-card"
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <img
          src="https://picsum.photos/600/450"
          alt="Product Image"
          className="w-full md:w-1/2 h-auto rounded-lg shadow-md object-cover"
          data-testid="product-image"
        />

        {/* Product Details */}
        <div className="flex-1">
          <h2
            className="text-4xl font-extrabold text-purple-800 mb-4 tracking-tight"
            data-testid="product-title"
          >
            {product.title}
          </h2>
          <p
            className="text-lg text-gray-700 mb-4 leading-relaxed"
            data-testid="product-description"
          >
            {product.description}
          </p>
          <p
            className="text-2xl font-bold text-green-700 mb-4"
            data-testid="product-price"
          >
            ${product.price}
          </p>
          <p
            className="text-sm text-gray-600"
            data-testid="product-average-rating"
          >
            Average Rating:{" "}
            <span className="font-semibold text-yellow-500">
              {product.average_rating.toFixed(1)} ★
            </span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <ReviewFormModal productId={productId} />
        <button
          onClick={toggleReviews}
          className="w-full md:w-auto bg-gray-300 text-gray-800 px-6 py-2 rounded-md shadow-md hover:bg-gray-400 transition duration-200"
          data-testid="toggle-reviews-button"
        >
          {isReviewsVisible ? "Hide Reviews" : "Show Reviews"}
        </button>
      </div>

      {/* Reviews Section */}
      {isReviewsVisible && product.reviews && product.reviews.length > 0 && (
        <div className="mt-6" data-testid="review-list">
          <ReviewList reviews={product.reviews} />
        </div>
      )}
      {isReviewsVisible && product.reviews && product.reviews.length === 0 && (
        <div
          className="mt-4 text-center text-gray-600"
          data-testid="no-reviews-message"
        >
          <p>No reviews available for this product.</p>
        </div>
      )}
    </div>
  );
}
