"use client";
import { Product } from "@/types/marketplace.types";
import { useEffect, useState } from "react";
import { ProductRow } from "./ProductRow";
import Link from "next/link";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("api/products").then((res) => res.json());
      setProducts(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="mt-8 px-8 max-w-screen-xl mx-auto"
      data-testid="product-list-container"
    >
      <div
        className="flex justify-between items-center mb-8"
        data-testid="header-container"
      >
        <Link href="/products/new">
          <button
            className="bg-purple-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-800 transition-colors"
            data-testid="add-product-button"
          >
            + Add Product
          </button>
        </Link>
      </div>
      <ul
        className="grid gap-10 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        data-testid="product-list"
      >
        {products && products.length > 0 ? (
          products.map((product) => (
            <li key={product.id} data-testid={`product-${product.id}`}>
              <ProductRow {...product} />
            </li>
          ))
        ) : (
          <p
            className="text-gray-600 text-center col-span-full"
            data-testid="no-products-message"
          >
            No products available. Add one to get started!
          </p>
        )}
      </ul>
    </div>
  );
}
