import ReviewForm from "@/components/ReviewForm";

export default function NewReview({
  params,
}: {
  params: { productId: string };
}) {
  const productId = params.productId;

  return (
    <div>
      <ReviewForm productId={productId} />
    </div>
  );
}
