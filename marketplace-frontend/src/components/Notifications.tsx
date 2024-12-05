"use client";
import React, { useContext } from "react";
import { NotificationsContext } from "@/contexts/NotificationsProvider";

interface ParsedMessage {
  event_type: string;
  service?: string;
  platform?: string;
  actor?: {
    username: string;
  };
  object: {
    title: string;
    price?: number;
  };
  timestamp?: string;
}

export default function NotificationsList() {
  const { messages } = useContext(NotificationsContext);

  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      <ul className="space-y-2">
        {[...messages].reverse().map((message, index) => {
          let parsedMessage: ParsedMessage | string;

          try {
            const eventTypeEndIndex = message.indexOf(" ");
            const jsonString = message.substring(eventTypeEndIndex + 1);
            parsedMessage = JSON.parse(jsonString);
          } catch (e) {
            parsedMessage = message;
          }

          if (typeof parsedMessage === "object" && parsedMessage !== null) {
            return (
              <li
                key={index}
                className="p-4 bg-white rounded-lg shadow-md border border-gray-200"
              >
                <div className="text-gray-800 font-medium">
                  Event: {parsedMessage.event_type}
                </div>
                {parsedMessage.service && (
                  <div className="text-gray-800 mt-1">
                    Service: {parsedMessage.service}
                  </div>
                )}
                {parsedMessage.platform && (
                  <div className="text-gray-800 mt-1">
                    Platform: {parsedMessage.platform}
                  </div>
                )}
                {parsedMessage.actor && (
                  <div className="text-gray-800 mt-1">
                    Actor: {parsedMessage.actor.username}
                  </div>
                )}
                <div className="text-gray-800 mt-1">
                  Product Title: {parsedMessage.object.title}
                </div>
                {parsedMessage.object.price !== undefined && (
                  <div className="text-gray-800 mt-1">
                    Price: ${parsedMessage.object.price}
                  </div>
                )}
                {parsedMessage.timestamp && (
                  <div className="text-sm text-gray-500 mt-1">
                    Timestamp:{" "}
                    {new Date(parsedMessage.timestamp).toLocaleString()}
                  </div>
                )}
              </li>
            );
          } else {
            return (
              <li
                key={index}
                className="p-4 bg-white rounded-lg shadow-md border border-gray-200"
              >
                <div className="text-gray-800 font-medium">{message}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleTimeString()}
                </div>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
}
