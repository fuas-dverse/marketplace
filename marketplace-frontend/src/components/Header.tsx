"use client";

import Link from "next/link";
import { useUser } from "@/contexts/UserProvider";
import { UserContext } from "@/contexts/UserProvider";
import { useRouter } from "next/navigation";

export default function Header() {
  // @ts-expect-error - Add types for user, loading, and error
  const { user, setUser } = useUser(UserContext);
  const router = useRouter();

  const handleLogout = () => {
    // Clear user session
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("username");
    }

    // Update context
    setUser(null);

    // Redirect to the login page
    router.push("/account");
  };

  return (
    <header className="bg-purple-950 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo or Title */}
        <Link
          href="/"
          className="text-3xl font-extrabold text-white tracking-tight"
        >
          Marketplace
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="flex items-center space-x-6 text-sm font-medium">
            <li>
              <Link
                href="/"
                className="hover:text-purple-300 transition"
                data-testid="header-nav-link-home"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/transactions"
                className="hover:text-purple-300 transition"
                data-testid="header-nav-link-transactions"
              >
                Transactions
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link
                    href="/chat"
                    className="hover:text-purple-300 transition"
                    data-testid="header-nav-link-chat"
                  >
                    Chat
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account"
                    className="hover:text-purple-300 transition"
                    data-testid="header-nav-link-account"
                  >
                    Account
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="hover:text-purple-300 transition bg-transparent border-none text-white"
                    data-testid="header-nav-link-logout"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/login"
                  className="hover:text-purple-300 transition"
                  data-testid="header-nav-link-login"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
