"use client";

import AccountCard from "@/components/AccountCard";
import Login from "@/components/Login";

export default function AccountPage() {
  if (!sessionStorage.getItem("username")) {
    return <Login />;
  }

  return <AccountCard />;
}
