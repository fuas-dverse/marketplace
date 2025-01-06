"use client";

import { useUser } from "@/contexts/UserProvider";
import { useState } from "react";

interface ProductFormProps {
  onSuccess: () => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { user, error: userError } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const productData = {
      title,
      description,
      price: parseFloat(price),
      seller_id: user?.id,
    };
    try {
      const res = await fetch(`${window.location.origin}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        throw new Error("Failed to submit product");
      }

      // Reset fields before showing success message
      setTitle("");
      setDescription("");
      setPrice("");

      const data = await res.json();
      console.log(data);

      // Show success message
      setSuccess("Product submitted successfully!");

      // Call onSuccess after short delay
      setTimeout(() => {
        setSuccess(null);
        onSuccess();
      }, 1000);
    } catch (error: Error | any) {
      setError(error.message || "An unknown error occurred");
    }
  };

  if (userError) return <div>Error: {userError}</div>;
  if (error) return <div>Error: {error}</div>;

  return success ? (
    <div
      className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative"
      data-testid="success-message"
    >
      {success}
    </div>
  ) : (
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
        className="bg-purple-900 text-white p-2 mt-4 rounded w-full"
        data-testid="submit-button"
      >
        Submit Product
      </button>
    </form>
  );
}
