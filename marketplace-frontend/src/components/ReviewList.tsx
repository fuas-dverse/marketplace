import React from "react";

interface Review {
  id: number;
  content: string;
  rating: number;
}

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${index < rating ? "text-yellow-500" : "text-gray-300"}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-2xl font-bold text-purple-800 mb-4">Reviews:</h3>
      <ul className="space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-lg">
                {renderStars(review.rating)}
              </p>
              <p className="text-gray-500 text-sm">Review ID: {review.id}</p>
            </div>
            <p className="text-gray-700">{review.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewList;
