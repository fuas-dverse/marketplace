import { useState } from "react";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch(`/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (response.ok) {
      const user = await response.json();
      onLogin(user);
    } else {
      console.error("Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
