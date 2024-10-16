// src/app/components/ProductList.tsx
import { useEffect, useState } from "react";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(`/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Available Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.title} - ${product.price} - Rating:{" "}
            {product.average_rating}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
