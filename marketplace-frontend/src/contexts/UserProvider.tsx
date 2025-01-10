"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserContextType } from "@/types/marketplace.types";

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState<boolean>(!initialUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialUser) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const response = await fetch("/api/get-user");
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
            sessionStorage.setItem(
              "username",
              JSON.stringify(userData.user.username)
            );
          } else {
            throw new Error("Unauthorized");
          }
        } catch (err) {
          setError("Failed to fetch user");
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
    const getUserInfo = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${initialUser?.username}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          sessionStorage.setItem("username", JSON.stringify(userData.username));
        } else {
          throw new Error("Unauthorized");
        }
      } catch (err) {
        setError("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    getUserInfo();
  }, [initialUser]);

  return (
    <UserContext.Provider value={{ user, setUser, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
