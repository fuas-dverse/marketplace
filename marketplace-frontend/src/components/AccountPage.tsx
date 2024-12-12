"use client";

import { useEffect, useState } from "react";
import AccountCard from "@/components/AccountCard";
import Login from "@/components/Login";
import Notifications from "@/components/Notifications";

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in by accessing sessionStorage
    const username = sessionStorage.getItem("username");
    setIsLoggedIn(!!username);
  }, []);

  // Show nothing or a loading state until useEffect has run
  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div>
      <AccountCard />
      <Notifications />
    </div>
  );
}
