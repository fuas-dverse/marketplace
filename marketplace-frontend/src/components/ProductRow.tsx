import { Product } from "@/types/marketplace.types";

export const ProductRow = (product: Product) => {
  return (
    <div>
      <h4 className="text-lg font-bold">{product.title}</h4>
      <div className="flex justify-between items-center mt-2">
        <p className="text-gray-700 font-semibold">${product.price}</p>
        <button className="bg-purple-950 text-white p-2 rounded-md hover:bg-purple-900 transition">
          Buy
        </button>
      </div>
      <p className="text-gray-600 mt-2">{product.description}</p>
    </div>
  );
};
