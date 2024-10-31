import { Product } from "@/types/marketplace.types";
import Link from "next/link";

export const ProductRow = (product: Product) => {
  return (
    <div className="border border-gray-200 rounded-lg shadow-lg mb-8 bg-white transition-transform transform hover:scale-105">
      <div className="flex p-6 gap-6">
        <img
          src="https://placehold.co/600x450"
          alt="Product Image"
          className="w-48 h-48 object-cover rounded-lg shadow-md"
        />
        <div className="flex flex-col justify-between flex-1">
          <div>
            <h4 className="text-2xl font-semibold text-purple-900 mb-2">
              <Link href={`/products/${product.id}`}>
                <span className="hover:underline">{product.title}</span>
              </Link>
            </h4>
            <p className="text-gray-700 text-sm line-clamp-3">
              {product.description}
            </p>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <p className="text-xl font-bold text-purple-700">
              ${product.price}
            </p>
            <Link href={`/products/${product.id}/buy`}>
              <button className="bg-purple-900 text-white px-5 py-2 rounded-md shadow hover:bg-purple-700 transition-colors">
                Buy Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
