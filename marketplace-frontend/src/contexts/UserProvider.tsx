"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserContextType } from "@/types/marketplace.types";

export const UserContext = createContext<UserContextType | null>(null);

type UserResponse = {
  message: string;
  user: User | null;
};

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: UserResponse | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState<boolean>(!initialUser); // Skip loading if initialUser is provided
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("initialUser", initialUser);
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
        const response = await fetch(
          `/api/users/${initialUser?.user?.username}`
        );
        console.log("response", response);
        if (response.ok) {
          const userData = await response.json();
          console.log("userdata", userData);
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
