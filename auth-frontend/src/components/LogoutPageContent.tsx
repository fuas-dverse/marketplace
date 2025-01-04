"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logout } from "@/app/actions/auth";

interface LogoutPageContentProps {
  defaultRedirect?: string; // Optional prop to specify the default redirect URL
}

export default function LogoutPageContent({
  defaultRedirect = "/",
}: LogoutPageContentProps) {
  const [redirectUrl, setRedirectUrl] = useState(defaultRedirect);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ensure we handle query parameters properly
    let redirect = searchParams.get("redirect_url");
    if (!redirect) {
      const urlParams = new URLSearchParams(window.location.search);
      redirect = urlParams.get("redirect_url") || defaultRedirect;
    }
    console.log("Final redirect:", redirect);
    setRedirectUrl(redirect); // Save the correct redirect URL
  }, [searchParams, defaultRedirect]);

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response.success) {
        console.log("Logout successful. Redirecting to:", redirectUrl);
        router.push(redirectUrl); // Redirect to the provided URL after logout
      } else {
        console.error("Logout failed:", response.message);
        alert("Failed to log out. Please try again.");
        router.push(defaultRedirect); // Redirect to default fallback on failure
      }
    } catch (error) {
      console.error("Logout encountered an error:", error);
      alert("An unexpected error occurred. Please try again.");
      router.push(defaultRedirect); // Redirect to default fallback on error
    }
  };

  useEffect(() => {
    // Ensure we only call logout after redirectUrl is updated
    if (redirectUrl !== defaultRedirect || defaultRedirect === "/") {
      handleLogout();
    }
  }, [redirectUrl]); // Trigger logout when redirectUrl is updated

  return <p>Logging out...</p>;
}
