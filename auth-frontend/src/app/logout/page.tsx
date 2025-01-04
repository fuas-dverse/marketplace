"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logout } from "../actions/auth";
import { Suspense } from "react";

function LogoutPageContent() {
  const [redirectUrl, setRedirectUrl] = useState("/");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get("redirect_url") || "/";
    setRedirectUrl(redirect); // Save redirect URL from query parameter
  }, [searchParams]);

  const handleLogout = async () => {
    const response = await logout();
    const result = response;
    console.log(result);
    if (result.success) {
      router.push(redirectUrl); // Redirect to login page after logout
    } else {
      console.error("Logout failed:", result.message);
      alert("Failed to log out. Please try again.");
      router.push("/"); // Redirect to home or some fallback page
    }
  };

  useEffect(() => {
    handleLogout();
  }, [router]);

  return <p>Logging out...</p>;
}

export default function LogoutPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LogoutPageContent />
    </Suspense>
  );
}
