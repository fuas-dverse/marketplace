"use client";

import AccountCard from "@/components/AccountCard";
import Login from "@/components/Login";
import Notifications from "@/components/Notifications";

export default function AccountPage() {
  if (!sessionStorage.getItem("username")) {
    return <Login />;
  }

  return (
    <div>
      <AccountCard />
      <Notifications />
    </div>
  );
}
