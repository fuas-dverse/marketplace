import React from "react";

interface TransactionStatusProps {
  status: "complete" | "pending" | "failed";
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ status }) => {
  const getMessage = () => {
    switch (status) {
      case "complete":
        return {
          title: "Transaction Complete",
          message:
            "Thank you for your purchase! Your transaction was successful.",
          bgColor: "bg-green-100",
          textColor: "text-green-600",
        };
      case "pending":
        return {
          title: "Transaction Pending",
          message:
            "Your transaction is currently being processed. Please check back later.",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-600",
        };
      case "failed":
        return {
          title: "Transaction Failed",
          message:
            "There was an issue with your transaction. Please try again.",
          bgColor: "bg-red-100",
          textColor: "text-red-600",
        };
      default:
        return {
          title: "Unknown Status",
          message: "Transaction status is unknown. Please contact support.",
          bgColor: "bg-gray-100",
          textColor: "text-gray-600",
        };
    }
  };

  const { title, message, bgColor, textColor } = getMessage();

  return (
    <div
      className={`p-4 rounded-md shadow-md ${bgColor} border border-gray-300`}
      data-testid="transaction-status-container"
    >
      <h2
        className={`text-2xl font-bold ${textColor}`}
        data-testid="transaction-status-title"
      >
        {title}
      </h2>
      <p className={`mt-2 ${textColor}`} data-testid="transaction-status-text">
        {message}
      </p>
    </div>
  );
};

export default TransactionStatus;
