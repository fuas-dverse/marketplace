"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReviewList from "./ReviewList";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  average_rating: number;
  reviews: Review[]; // Add reviews array here
}

interface Review {
  id: number;
  content: string; // Adjust based on your actual review structure
  rating: number;
}

interface ProductCardProps {
  productId: string;
}

export default function ProductCard(props: ProductCardProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReviewsVisible, setIsReviewsVisible] = useState<boolean>(false); // State for reviews visibility
  const { productId } = props;

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId]);

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

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`).then(
        (res) => res.json()
      );
      setProduct((prev) => (prev ? { ...prev, reviews: res.reviews } : null));
    } catch (error: Error | any) {
      setError(error.message);
    }
  };

  const toggleReviews = () => {
    setIsReviewsVisible((prev) => !prev); // Toggle visibility of reviews
  };

  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-8">
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src="https://placehold.co/600x450"
          alt="Product Image"
          className="w-full md:w-1/2 h-auto rounded-lg shadow-md object-cover"
        />
        <div className="flex-1">
          <h2 className="text-4xl font-bold text-purple-800 mb-4">
            {product.title}
          </h2>
          <p className="text-lg text-gray-700 mb-4">{product.description}</p>
          <p className="text-2xl font-semibold text-green-700 mb-4">
            Price: ${product.price}
          </p>
          <p className="text-sm text-gray-600">
            Average Rating: {product.average_rating.toFixed(1)} ★
          </p>
        </div>
      </div>
      <div className="mt-6">
        <Link href={`/products/${productId}/review`}>
          <button className="w-full md:w-auto bg-purple-700 text-white px-6 py-3 rounded-md shadow-md hover:bg-purple-800 transition duration-200">
            Add Review
          </button>
        </Link>
        <button
          onClick={toggleReviews}
          className="mt-4 w-full md:w-auto bg-gray-300 text-gray-800 px-6 py-2 rounded-md shadow-md hover:bg-gray-400 transition duration-200"
        >
          {isReviewsVisible ? "Hide Reviews" : "Show Reviews"}
        </button>
      </div>
      {isReviewsVisible && product.reviews && product.reviews.length > 0 && (
        <ReviewList reviews={product.reviews} />
      )}
      {isReviewsVisible && product.reviews && product.reviews.length === 0 && (
        <div className="mt-4">
          <p>No reviews available for this product.</p>
        </div>
      )}
    </div>
  );
}
