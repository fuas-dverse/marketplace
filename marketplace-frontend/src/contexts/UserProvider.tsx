"use client";

import {
  User,
  UserContextType,
  UserProviderProps,
} from "@/types/marketplace.types";
import React, { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const username = sessionStorage.getItem("username");
        const response = await fetch(`/api/users/${username}`).then((res) =>
          res.json()
        );
        if (response.error) {
          throw new Error(
            `Error fetching user in hook: ${response.statusText}`
          );
        }
        setUser(response);
      } catch (error: Error | any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(UserContext: any) {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
