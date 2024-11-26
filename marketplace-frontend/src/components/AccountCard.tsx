"use client";

import { UserContext, useUser } from "@/contexts/UserContext";
import React from "react";

export default function AccountCard() {
  const { user, loading, error } = useUser(UserContext);

  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-sm mx-auto bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
      {user ? (
        <>
          <div className="flex items-center p-4">
            <img
              src="https://placehold.co/320x320"
              alt="User Image"
              className="w-16 h-16 rounded-full border-2 border-purple-950"
              data-testid="user-image"
            />
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900">
                {user.username}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-100">
            <p className="text-sm text-gray-700 mb-4">{user.username}</p>
            <div className="flex space-x-4">
              <button className="w-full bg-purple-950 text-white py-2 px-4 rounded-md hover:bg-purple-900 transition">
                Follow
              </button>
              <button className="w-full border border-purple-950 text-purple-950 py-2 px-4 rounded-md hover:bg-purple-900 hover:text-white transition">
                Message
              </button>
            </div>
          </div>
        </>
      ) : (
        <p
          className="text-gray-600 text-center col-span-full"
          data-testid="no-user-message"
        >
          No user was found.
        </p>
      )}
    </div>
  );
}
