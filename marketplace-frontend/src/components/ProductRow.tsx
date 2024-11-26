import { Product } from "@/types/marketplace.types";
import Link from "next/link";

export const ProductRow = (product: Product) => {
  return (
    <div
      className="border border-gray-200 rounded-lg shadow-lg mb-8 bg-white transition-transform transform hover:scale-105"
      data-testid="product-container"
    >
      <div className="flex flex-wrap p-6 gap-6 sm:gap-4">
        <img
          src="https://placehold.co/600x450"
          alt="Product Image"
          className="w-full sm:w-48 h-auto object-cover rounded-lg shadow-md flex-shrink-0"
          data-testid="product-image"
        />
        <div className="flex flex-col justify-between flex-1">
          <div>
            <h4
              className="text-xl sm:text-2xl font-semibold text-purple-900 mb-2"
              data-testid="product-title"
            >
              <Link href={`/products/${product.id}`} data-testid="product-link">
                <span className="hover:underline">{product.title}</span>
              </Link>
            </h4>
            <p
              className="text-gray-700 text-sm sm:text-base line-clamp-3"
              data-testid="product-description"
            >
              {product.description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 pt-4 border-t border-gray-200 gap-4 sm:gap-0">
            <p
              className="text-lg sm:text-xl font-bold text-purple-700 px-2"
              data-testid="product-price"
            >
              ${product.price}
            </p>
            <Link
              href={`/products/${product.id}/buy`}
              data-testid="product-buy-link"
            >
              <button
                className="bg-purple-900 text-white px-4 sm:px-5 py-2 rounded-md shadow hover:bg-purple-700 transition-colors"
                data-testid="product-button"
              >
                Buy Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
