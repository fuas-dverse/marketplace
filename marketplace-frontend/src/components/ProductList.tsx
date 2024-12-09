"use client";

import { Product } from "@/types/marketplace.types";
import { useEffect, useState } from "react";
import { ProductRow } from "./ProductRow";
import TransactionModal from "./Transaction";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products").then((res) => res.json());
      setProducts(response);
      setFilteredProducts(response); // Initialize filtered products
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div
      className="mt-8 px-6 lg:px-12 max-w-screen-xl mx-auto"
      data-testid="product-list-container"
    >
      {/* Search Bar */}
      <div className="flex justify-between items-center mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for products..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          data-testid="search-bar"
        />
      </div>

      {/* Product List */}
      <ul
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        data-testid="product-list"
      >
        {filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <li
              key={product.id}
              data-testid={`product-item-${product.id}`}
              role="listitem"
            >
              <ProductRow {...product} onBuyNow={() => openModal(product)} />
            </li>
          ))
        ) : (
          <p
            className="text-gray-600 text-center col-span-full bg-white p-4 rounded-lg shadow"
            data-testid="no-products-message"
          >
            No products match your search.
          </p>
        )}
      </ul>

      {/* Transaction Modal */}
      {selectedProduct?.id && (
        <TransactionModal
          productId={selectedProduct.id}
          onClose={closeModal}
          data-testid="transaction-modal"
        />
      )}
    </div>
  );
}
