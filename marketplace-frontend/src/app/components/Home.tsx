"use client";
import { useState } from "react";
import Header from "./Header";
import Login from "./Login";
import ProductList from "./ProductList";

interface User {
  username: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setUser(user);
  };

  return (
    <>
      <Header />
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="mt-10 p-4 bg-purple-50 shadow-lg rounded-md">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user.username}
          </h2>
          <ProductList />
        </div>
      )}
    </>
  );
}
