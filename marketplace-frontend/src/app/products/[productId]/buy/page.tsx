import Transaction from "@/components/Transaction";

export default function ProductDetails({
  params,
}: {
  params: { productId: string };
}) {
  const productId = params.productId;
  return <Transaction productId={productId} onClose={() => {}} />;
}
