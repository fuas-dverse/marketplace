"use client";

import { useState } from "react";

interface Message {
  sender: "user" | "bot";
  content: string;
  suggestions?: SuggestedProduct[]; // Optional for bot responses
}

interface SuggestedProduct {
  id: string;
  title: string;
  description: string;
  price: number;
}

const sampleProducts: SuggestedProduct[] = [
  {
    id: "1",
    title: "Wireless Earbuds",
    description: "High-quality sound and noise cancellation.",
    price: 99.99,
  },
  {
    id: "2",
    title: "Smart Watch",
    description: "Track your fitness and stay connected on the go.",
    price: 199.99,
  },
  {
    id: "3",
    title: "Gaming Mouse",
    description: "Precision and comfort for serious gamers.",
    price: 49.99,
  },
];

export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: "user", content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = inputValue.toLowerCase().includes("products")
        ? {
            sender: "bot",
            content: "Here are some products you might like:",
            suggestions: sampleProducts,
          }
        : {
            sender: "bot",
            content: "This is a response from the bot!",
          };

      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col max-w-lg mx-auto border border-gray-200 rounded-lg shadow-md overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-purple-950 text-white px-6 py-4 text-lg font-semibold">
        Chat
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg shadow-md max-w-sm ${
                    message.sender === "user"
                      ? "bg-purple-900 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
              {message.suggestions && (
                <div className="mt-2 flex flex-col space-y-2">
                  {message.suggestions.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-300 p-3 rounded-lg shadow hover:shadow-md transition"
                    >
                      <h4 className="text-purple-900 font-semibold text-lg">
                        {product.title}
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {product.description}
                      </p>
                      <p className="text-green-700 font-bold text-sm">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">
            Start a conversation with the bot!
          </p>
        )}
      </div>

      {/* Input Section */}
      <div className="flex items-center border-t border-gray-300 p-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        />
        <button
          onClick={handleSendMessage}
          className="ml-4 bg-purple-900 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
