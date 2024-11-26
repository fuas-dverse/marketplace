"use client";

import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { UserContext } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, setUser, loading, error } = useUser(UserContext);
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
    <header className="bg-purple-950 text-white p-4 shadow-md flex items-center">
      <h1 className="text-3xl font-bold">Marketplace</h1>
      <nav className="flex ml-auto">
        <ul className="flex items-center space-x-4">
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
          {user ? (
            <>
              <li>
                <Link href="/account" className="hover:underline">
                  Account
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="hover:underline bg-transparent border-none text-white"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
