"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedPage({
  isAuthenticated,
  user,
}: {
  isAuthenticated: boolean;
  user: { username: string } | null;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <p>Redirecting...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to the Protected Page</h1>
        {user && <p className="mt-4">Hello, {user.username}!</p>}
      </div>
    </div>
  );
}
