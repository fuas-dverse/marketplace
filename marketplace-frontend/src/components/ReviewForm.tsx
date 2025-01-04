"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { useUser } from "@/contexts/UserProvider";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewFormModal({ productId }: ReviewFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { user } = useUser();

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const reviewData = {
      rating: parseFloat(rating),
      content,
      product_id: productId,
      user_id: user?.id,
    };

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!res.ok) {
        throw new Error("Failed to submit review.");
      }

      // Show success message
      setSuccess("Review submitted successfully!");

      // Close modal after 1 second
      setTimeout(() => {
        setSuccess(null);
        toggleModal();
      }, 1000);

      // Clear form fields
      setRating("");
      setContent("");
    } catch (error: any) {
      setError(error.message);
      console.error(error);
    }
  };

  return (
    <>
      {/* Button to open modal */}
      <button
        onClick={toggleModal}
        className="w-full md:w-auto bg-purple-700 text-white px-6 py-3 rounded-md shadow-md hover:bg-purple-800 transition duration-200"
        data-testid="add-review-button"
      >
        Add Review
      </button>

      {/* Modal with the review form */}
      <Modal isOpen={isModalOpen} onClose={toggleModal}>
        {success ? (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative mb-4"
            data-testid="success-toast"
          >
            {success}
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-purple-900">
              Add Review
            </h2>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              data-testid="review-form"
            >
              <div>
                <label htmlFor="rating" className="block text-gray-700">
                  Rating:
                </label>
                <input
                  type="number"
                  id="rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  required
                  className="border border-gray-300 p-2 w-full rounded-md"
                  data-testid="input-rating"
                  max={5}
                  min={1}
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-gray-700">
                  Content:
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="border border-gray-300 p-2 w-full rounded-md"
                  data-testid="input-content"
                />
              </div>

              <button
                type="submit"
                className="bg-purple-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-800 transition w-full"
                data-testid="submit-review-button"
              >
                Submit Review
              </button>
            </form>
          </>
        )}
      </Modal>
    </>
  );
}
