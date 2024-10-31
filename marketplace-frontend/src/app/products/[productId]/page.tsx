import ProductCard from "@/components/ProductCard";

export default function ProductDetails({
  params,
}: {
  params: { productId: string };
}) {
  const productId = params.productId;
  return <ProductCard productId={productId} />;
}
