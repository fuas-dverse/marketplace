"use client";

import React, { useState, useEffect } from "react";

const ConsentPage: React.FC = () => {
  const [consent, setConsent] = useState({
    analytics: false,
    marketing: false,
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Fetch current consent status from the backend
    fetch("/api/consent")
      .then((response) => response.json())
      .then((data) =>
        setConsent(data.consent || { analytics: false, marketing: false })
      )
      .catch((error) => console.error("Error fetching consent data:", error));
  }, []);

  const handleConsentChange = (type: string, value: boolean) => {
    setConsent((prev) => ({ ...prev, [type]: value }));
  };

  const saveConsent = () => {
    fetch("/api/consent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ consent }),
    })
      .then((response) => {
        if (response.ok) {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
        }
      })
      .catch((error) => console.error("Error saving consent:", error));
  };

  return (
    <div className="flex justify-center items-center">
      <div className="container mx-auto p-6 bg-white text-gray-800 shadow-md rounded-lg max-w-xl">
        <h1 className="text-3xl font-bold mb-4">Manage Your Consent</h1>
        <p className="mb-6 text-gray-600">
          Here you can manage your consent preferences for data collection and
          processing. Learn more about our policies by visiting our
          <a href="/privacy" className="text-blue-500 hover:underline">
            {" "}
            Privacy Policy{" "}
          </a>
          and{" "}
          <a href="/terms" className="text-blue-500 hover:underline">
            Terms of Service
          </a>
          .
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="analytics" className="text-base font-medium">
              Analytics
            </label>
            <input
              id="analytics"
              type="checkbox"
              checked={consent.analytics}
              onChange={(e) =>
                handleConsentChange("analytics", e.target.checked)
              }
              className="h-5 w-5"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="marketing" className="text-base font-medium">
              Marketing
            </label>
            <input
              id="marketing"
              type="checkbox"
              checked={consent.marketing}
              onChange={(e) =>
                handleConsentChange("marketing", e.target.checked)
              }
              className="h-5 w-5"
            />
          </div>
        </div>

        <button
          onClick={saveConsent}
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Save Preferences
        </button>

        {isSaved && (
          <p className="mt-4 text-green-600 text-center">
            Your preferences have been saved.
          </p>
        )}
      </div>
    </div>
  );
};

export default ConsentPage;
