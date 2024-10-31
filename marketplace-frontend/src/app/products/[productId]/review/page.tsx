import ReviewForm from "@/components/ReviewForm";

interface ReviewPageParams {
  productId: string;
}

export default function NewReview(params: ReviewPageParams) {
  const productId = params.productId;

  return (
    <div>
      <ReviewForm productId={productId} />
    </div>
  );
}
