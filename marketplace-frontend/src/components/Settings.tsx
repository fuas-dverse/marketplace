"use client";

import { UserContext, useUser } from "@/contexts/UserProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SettingsProps {
  onSuccess: () => void;
}

export default function Settings({ onSuccess }: SettingsProps) {
  const [userData, setUserData] = useState({
    username: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // @ts-expect-error - Add types for user, loading, and error
  const { user, setUser, error: userError } = useUser(UserContext);

  const router = useRouter();

  const handleDataUpdate = async (e: React.FormEvent) => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/users/${user.username}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update data");
      }

      const data = await res.json();
      console.log(data);

      // Show success toast
      setSuccess("Username updated successfully!");

      sessionStorage.removeItem("username");

      // Update context
      setUser(null);

      window.location.reload();
      // Redirect to the login page
      router.push("/");

      // Close modal after short delay
      setTimeout(() => {
        setSuccess(null);
        onSuccess(); // Close the modal
      }, 1000);

      // Clear form fields
      setUserData({ username: "" });
    } catch (error: Error | any) {
      setError(error.message || "An unknown error occurred");
    }
  };

  const handleDataExport = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/users/${user.username}`,
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to export data");
      }

      const data = await res.json();

      // Convert JSON to downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${user.username}-data.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success toast
      setSuccess("Data exported successfully!");
    } catch (error: unknown) {
      setError((error as Error).message || "An unknown error occurred");
    }
  };

  const handleDataDelete = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/users/${user.username}`,
        {
          method: "DELETE",
        }
      );

      if (res.status !== 204) {
        throw new Error("Failed to delete data");
      }

      // Show success toast
      setSuccess("Account deleted successfully!");

      sessionStorage.removeItem("username");

      // Update context
      setUser(null);

      window.location.reload();
      // Redirect to the login page
      router.push("/");

      // Close modal after short delay
      setTimeout(() => {
        setSuccess(null);
        onSuccess(); // Close the modal
      }, 1000);
    } catch (error: Error | any) {
      setError(error.message || "An unknown error occurred");
    }
  };

  if (userError) return <div>Error: {userError}</div>;
  if (error) return <div>Error: {error}</div>;

  return success ? (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative">
      {success}
    </div>
  ) : (
    <div className="flex flex-col space-y-4 mt-6">
      <input
        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        type="text"
        placeholder="New Username"
        value={userData.username}
        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
      />
      <button
        onClick={handleDataUpdate}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        Update Data
      </button>
      <button
        onClick={handleDataExport}
        className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
      >
        Export Data to JSON
      </button>
      <button
        onClick={handleDataDelete}
        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
      >
        Delete Account
      </button>
    </div>
  );
}
