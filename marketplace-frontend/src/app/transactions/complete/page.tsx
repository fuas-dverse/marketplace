import Link from "next/link";

export default function TransactionCompletePage() {
  return (
    <div className="container mx-auto p-6 text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">
        Transaction Complete!
      </h1>
      <p className="text-lg mb-4">
        Thank you for your purchase. Your transaction has been successfully
        processed.
      </p>
      <p className="text-md mb-4">
        You will receive a confirmation email shortly.
      </p>
      <Link
        href="/products"
        className="bg-purple-950 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition"
      >
        Go back to Product List
      </Link>
    </div>
  );
}
