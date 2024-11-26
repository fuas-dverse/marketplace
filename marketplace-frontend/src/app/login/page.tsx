"use client";

import Login from "@/components/Login";

export default function LoginPage() {
  if (!sessionStorage.getItem("username")) {
    return <Login />;
  }
}
