"use client";

import { useState } from "react";

export default function ProductForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const productData = {
      title,
      description,
      price: parseFloat(price),
      seller_id: "9c62d374-64c9-4118-925d-da23b849194b",
    };

    try {
      const res = await fetch(`${window.location.origin}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      }).then((res) => res.json());

      console.log(res);
    } catch (error: Error | any) {
      {
        setError(error.message);
      }
    }

    // Clear the form fields after submission
    setTitle("");
    setDescription("");
    setPrice("");
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label htmlFor="title" className="block">
          Title:
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border border-gray-300 p-2 w-full"
          data-testid="input-title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block">
          Description:
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="border border-gray-300 p-2 w-full"
          data-testid="input-description"
        />
      </div>

      <div>
        <label htmlFor="price" className="block">
          Price:
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="border border-gray-300 p-2 w-full"
          data-testid="input-price"
        />
      </div>

      <button
        type="submit"
        className="bg-purple-900 text-white p-2 mt-4 rounded"
        data-testid="submit-button"
      >
        Submit Product
      </button>
    </form>
  );
}
