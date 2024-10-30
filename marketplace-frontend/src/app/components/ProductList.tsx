"use client";
import { Product } from "@/types/marketplace.types";
import { useEffect, useState } from "react";
import { ProductRow } from "./ProductRow";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("api/products").then((res) => res.json());
      setProducts(response.products);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Product List</h3>
      <ul className="space-y-4">
        {products &&
          products.length > 0 &&
          products.map((product) => (
            <li key={product.id} className="bg-white p-4 rounded-md shadow-md">
              <ProductRow {...product} />
            </li>
          ))}
      </ul>
    </div>
  );
}
