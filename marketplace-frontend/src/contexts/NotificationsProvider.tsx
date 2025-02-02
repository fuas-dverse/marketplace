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

const WEBSOCKET_URL = process.env.WEBSOCKET_URL;

export const NotificationsContext = createContext<NotificationsContextProps>({
  messages: [],
});

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [shownToasts, setShownToasts] = useState<Set<string>>(new Set());
  const latestMessage = useWebSocket(WEBSOCKET_URL ?? "ws://localhost:5003/ws");
  const pathname = usePathname(); // Get the current path

  useEffect(() => {
    const tempMessages = JSON.parse(
      sessionStorage?.getItem("notifications") || "[]"
    );
    setMessages(tempMessages);
  }, []);

  useEffect(() => {
    if (latestMessage && typeof latestMessage === "string") {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, latestMessage];
        sessionStorage.setItem(
          "notifications",
          JSON.stringify(updatedMessages)
        );
        return updatedMessages;
      });

      // Parse event and JSON data
      const jsonString = latestMessage.substring(
        latestMessage.indexOf(" ") + 1
      );
      const event = latestMessage.substring(0, latestMessage.indexOf(" "));
      let parsedMessage: ParsedMessage | string;
      try {
        parsedMessage = JSON.parse(jsonString);
      } catch (e) {
        parsedMessage = latestMessage;
        console.error(e);
      }

      // Show toast only if it hasn't been shown before and pathname is not '/account'
      if (
        typeof parsedMessage === "object" &&
        parsedMessage !== null &&
        !shownToasts.has(latestMessage)
      ) {
        if (
          pathname !== "/account" &&
          event &&
          event.includes("product.created")
        ) {
          toast.info(`Product created: ${parsedMessage.object.title}`);
          setShownToasts((prevShownToasts) =>
            new Set(prevShownToasts).add(latestMessage)
          );
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
