import React from "react";
import termsOfService from "../dictionaries/terms_of_service.json";

const TermsOfService: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="terms-of-service container mx-auto p-6 bg-white text-gray-800 shadow-md rounded-lg max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-6">
          <strong>Effective Date:</strong> {termsOfService.effectiveDate}
        </p>

        {termsOfService.sections.map((section, index) => (
          <div key={index} className="terms-section mb-6">
            <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
            {Array.isArray(section.content) ? (
              <ul className="list-disc list-inside space-y-2">
                {section.content.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-base leading-relaxed">{section.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TermsOfService;
