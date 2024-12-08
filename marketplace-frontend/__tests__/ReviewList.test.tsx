import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReviewList from "@/components/ReviewList";

const mockReviews = [
  { id: 1, content: "Great product!", rating: 5 },
  { id: 2, content: "Not bad", rating: 3 },
  { id: 3, content: "Could be better", rating: 2 },
];

describe("ReviewList Component Tests", () => {
  it("should render the ReviewList component with reviews", () => {
    render(<ReviewList reviews={mockReviews} />);

    // Check that the container, title, and list are rendered
    expect(screen.getByTestId("review-list-container")).toBeInTheDocument();
    expect(screen.getByTestId("review-list-title")).toHaveTextContent(
      "Reviews"
    );
    expect(screen.getByTestId("review-list")).toBeInTheDocument();

    // Check that each review is rendered with correct content and rating
    mockReviews.forEach((review) => {
      expect(screen.getByTestId(`review-${review.id}`)).toBeInTheDocument();
      expect(
        screen.getByTestId(`review-content-${review.id}`)
      ).toHaveTextContent(review.content);
      expect(
        screen.getByTestId(`review-rating-${review.id}`)
      ).toBeInTheDocument();
    });
  });

  it("should render the correct number of stars for each review", () => {
    render(<ReviewList reviews={mockReviews} />);

    mockReviews.forEach((review) => {
      const stars = screen
        .getByTestId(`review-rating-${review.id}`)
        .querySelectorAll("span");
      const filledStars = Array.from(stars).filter((star) =>
        star.classList.contains("text-yellow-500")
      );
      expect(filledStars.length).toBe(review.rating);
    });
  });

  it("should render a message if there are no reviews", () => {
    render(<ReviewList reviews={[]} />);

    const noReviewsMessage = screen.getByTestId("no-reviews-message");
    expect(noReviewsMessage).toBeInTheDocument();
  });
});
