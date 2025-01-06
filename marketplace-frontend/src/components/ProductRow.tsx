"use client";

import { Product } from "@/types/marketplace.types";
import Image from "next/image";

export const ProductRow = (product: Product & { onBuyNow: () => void }) => {
  return (
    <div
      className="border border-gray-200 rounded-lg shadow-md bg-white overflow-hidden transition-transform transform hover:scale-105"
      data-testid="product-container"
    >
      <Image
        src="https://picsum.photos/600/450"
        alt="Product Image"
        className="w-full h-48 object-cover sm:h-64"
        data-testid="product-image"
      />
      <div className="p-6 flex flex-col justify-between">
        <div>
          <h4
            className="text-xl font-extrabold text-purple-900 mb-2 tracking-tight"
            data-testid="product-title"
          >
            <span className="hover:underline">{product.title}</span>
          </h4>
          <p
            className="text-gray-700 text-sm sm:text-base line-clamp-2 font-medium"
            data-testid="product-description"
          >
            {product.description}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <p
            className="text-lg font-bold text-purple-700"
            data-testid="product-price"
          >
            ${product.price}
          </p>
          <button
            onClick={product.onBuyNow}
            className="bg-purple-900 text-white px-4 py-2 rounded-md shadow hover:bg-purple-700 transition-colors font-medium"
            data-testid="product-buy-button"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
