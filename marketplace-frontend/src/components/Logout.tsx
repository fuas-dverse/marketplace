"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    // Clear user session
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userId");
    }

    // Redirect to the login page
    router.push("/account");
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-600">Logging out...</p>
    </div>
  );
}
