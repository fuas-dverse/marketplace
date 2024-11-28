"use client";
import React, { createContext, useEffect, useState, ReactNode } from "react";
import useWebSocket from "../hooks/useWebsocket";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";

interface NotificationsContextProps {
  messages: string[];
}

interface ParsedMessage {
  event_type: string;
  object: {
    title: string;
  };
}

export const NotificationsContext = createContext<NotificationsContextProps>({
  messages: [],
});

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<string[]>([]);
  const latestMessage = useWebSocket("ws://localhost:8000/ws");
  const pathname = usePathname(); // Get the current path

  useEffect(() => {
    if (latestMessage && typeof latestMessage === "string") {
      setMessages((prevMessages) => [...prevMessages, latestMessage]);

      // Check if the user is not on the "/account" page
      if (pathname !== "/account" && latestMessage) {
        // Show the toast notification if the user is on the "/account" page
        const jsonString = latestMessage.substring(
          latestMessage.indexOf(" ") + 1
        );
        let parsedMessage: ParsedMessage | string;
        try {
          parsedMessage = JSON.parse(jsonString);
        } catch (e) {
          parsedMessage = latestMessage;
        }
        if (typeof parsedMessage === "object" && parsedMessage !== null) {
          toast.info(
            `New Event: ${parsedMessage.event_type}, Product: ${parsedMessage.object.title}`
          );
        } else {
          toast.info(latestMessage);
        }
      }
    }
  }, [latestMessage, pathname]);

  return (
    <NotificationsContext.Provider value={{ messages }}>
      {children}
    </NotificationsContext.Provider>
  );
};
