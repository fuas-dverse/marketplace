import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-purple-950 text-white p-4 shadow-md">
      <h1 className="text-3xl font-bold">Marketplace</h1>
      <nav className="mt-2">
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link href="/transactions" className="hover:underline">
              Transactions
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
