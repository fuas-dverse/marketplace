import Link from "next/link";

export default function Header() {
  return (
    <header
      className="bg-purple-950 text-white p-4 shadow-md"
      data-testid="header"
    >
      <h1 className="text-3xl font-bold" data-testid="header-title">
        Marketplace
      </h1>
      <nav className="mt-2" data-testid="header-nav-container">
        <ul className="flex space-x-4">
          <li>
            <Link
              href="/"
              className="hover:underline"
              data-testid="header-nav-link-home"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/transactions"
              className="hover:underline"
              data-testid="header-nav-link-transactions"
            >
              Transactions
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
