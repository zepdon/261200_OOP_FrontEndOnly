// src/hooks/useBoardUpdates.ts
import { useState, useEffect } from "react";

interface BoardUpdate {
  row: number;
  col: number;
  player: string;
}

export const useBoardUpdates = (): BoardUpdate[] => {
  const [updates, setUpdates] = useState<BoardUpdate[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws/board");

    ws.onopen = () => {
      console.log("Connected to board WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as BoardUpdate;
        setUpdates((prev) => [...prev, data]);
        console.log("Received board update:", data);
      } catch (error) {
        console.error("Error parsing board update:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return updates;
};
