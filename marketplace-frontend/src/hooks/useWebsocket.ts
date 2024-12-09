import { useEffect, useRef, useState } from "react";

const useWebSocket = (url: string) => {
  const [message, setMessage] = useState<string>("");
  const socketRef = useRef<WebSocket | null>(null);
  const retryTimeout = useRef<number | null>(null);

  const connect = () => {
    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      console.log("WebSocket connection opened:", url);
    };

    socketRef.current.onmessage = (event) => {
      console.log("Received message:", event.data);
      setMessage(event.data);
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
      if (event.code !== 1000) {
        console.log("Attempting to reconnect in 5 seconds...");
        retryTimeout.current = window.setTimeout(() => {
          connect();
        }, 5000);
      }
    };
  };

  useEffect(() => {
    connect();

    // Cleanup when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounted");
      }
      if (retryTimeout.current !== null) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [url]);

  return message;
};

export default useWebSocket;
