import React from "react";

interface Review {
  id: string;
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

  if (!reviews || reviews.length < 1)
    return (
      <div data-testid="no-reviews-message">Error: No reviews available.</div>
    );

  return (
    <div className="mt-6 border-t pt-6" data-testid="review-list-container">
      <h3
        className="text-2xl font-bold text-purple-800 mb-4"
        data-testid="review-list-title"
      >
        Reviews
      </h3>
      <ul className="space-y-4" data-testid="review-list">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="p-4 bg-white rounded-lg shadow-md"
            data-testid={`review-${review.id}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p
                className="font-semibold text-lg"
                data-testid={`review-rating-${review.id}`}
              >
                {renderStars(review.rating)}
              </p>
            </div>
            <p
              className="text-gray-700"
              data-testid={`review-content-${review.id}`}
            >
              {review.content}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewList;
