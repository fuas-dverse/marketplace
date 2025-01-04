"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logout } from "@/app/actions/auth";

const defaultRedirect = "/";

export default function LogoutPageContent() {
  const [redirectUrl, setRedirectUrl] = useState(defaultRedirect);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get("redirect_url") || redirectUrl;
    setRedirectUrl(redirect);
  }, [searchParams, redirectUrl]);

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (!response?.success) {
        alert("Failed to log out. Please try again.");
      }
    } catch (error) {
      console.error("Logout encountered an error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      router.push(redirectUrl);
    }
  };

  useEffect(() => {
    handleLogout();
  }, [redirectUrl]);

  return <p>Logging out...</p>;
}
