import { useState } from "react";
import Header from "./components/Header";
import Login from "./components/Login";
import ProductList from "./components/ProductList";

export default function Home() {
  const [user, setUser] = useState(null);

  const handleLogin = (user) => {
    setUser(user);
  };

  return (
    <main>
      <Header />
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div>
          <h2>Welcome, {user.username}</h2>
          <ProductList />
        </div>
      )}
    </main>
  );
}
