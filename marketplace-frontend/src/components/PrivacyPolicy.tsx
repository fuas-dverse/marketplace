import React from "react";
import privacyPolicy from "../dictionaries/privacy_policy.json";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="privacy-policy container mx-auto p-6 bg-white text-gray-800 shadow-md rounded-lg max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-6">
          <strong>Effective Date:</strong> {privacyPolicy.effectiveDate}
        </p>

        {privacyPolicy.sections.map((section, index) => (
          <div key={index} className="privacy-section mb-6">
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

            {section.subsections && (
              <div className="privacy-subsections mt-4">
                {section.subsections.map((subsection, subIdx) => (
                  <div key={subIdx} className="privacy-subsection mb-4">
                    <h3 className="text-xl font-medium mb-1">
                      {subsection.subtitle}
                    </h3>
                    <p className="text-base leading-relaxed">
                      {subsection.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
