import { User } from "@/types/marketplace.types";
import { useState } from "react";

interface RegisterProps {
  onRegister: (user: User) => void;
}

export default function Register({ onRegister }: RegisterProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onRegister({ username, password });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-lg rounded-md space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="w-full bg-purple-950 text-white p-2 rounded-md hover:bg-purple-900 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
