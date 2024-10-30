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
            <Link href="/products" className="hover:underline">
              Products
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
