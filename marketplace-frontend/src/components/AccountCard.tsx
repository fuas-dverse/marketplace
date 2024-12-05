"use client";

import { UserContext, useUser } from "@/contexts/UserProvider";
import { useState } from "react";
import ProductForm from "./ProductForm";
import Settings from "./Settings";

export default function AccountCard() {
  // @ts-ignore
  const { user, loading, error } = useUser(UserContext);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleProductModalToggle = () => {
    setIsProductModalOpen(!isProductModalOpen);
  };

  const handleSettingsModalToggle = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );

  if (loading || !user)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      {/* Header with background image */}
      <div
        className="relative h-32 flex items-center justify-start px-6"
        style={{
          backgroundImage: `url('https://picsum.photos/600')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img
          src="https://picsum.photos/100"
          alt="User Image"
          className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
          data-testid="user-image"
        />
        <div className="ml-4 text-white">
          <h3 className="text-xl font-bold">{user.username}</h3>
          <p className="text-sm">{user.email}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-sm text-gray-700 mb-6">
          Welcome, <span className="font-bold">{user.username}</span>! Start
          exploring or manage your products.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={handleProductModalToggle}
            className="w-full bg-purple-950 text-white py-3 px-4 rounded-lg hover:bg-purple-900 transition shadow-md"
            data-testid="add-product-modal-button"
          >
            + Add Product
          </button>
          <button
            onClick={handleSettingsModalToggle}
            className="w-full border border-purple-950 text-purple-950 py-3 px-4 rounded-lg hover:bg-purple-900 hover:text-white transition shadow-md"
            data-testid="settings-modal-button"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <button
                onClick={handleProductModalToggle}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ProductForm onSuccess={handleProductModalToggle} />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Settings</h2>
              <button
                onClick={handleSettingsModalToggle}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <Settings onSuccess={handleSettingsModalToggle} />
          </div>
        </div>
      )}
    </div>
  );
}
