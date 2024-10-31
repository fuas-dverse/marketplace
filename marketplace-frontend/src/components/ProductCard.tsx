"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  average_rating: number;
}

interface ProductCardProps {
  productId: string;
}

export default function ProductCard(props: ProductCardProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { productId } = props;

  useEffect(() => {
    fetchProduct();
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
      </div>
    </div>
  );
}
