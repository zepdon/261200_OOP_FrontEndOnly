import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

interface BoardUpdate {
  row: number;
  col: number;
  player: string;
}

export const useBoardUpdates = (): BoardUpdate[] => {
  const [updates, setUpdates] = useState<BoardUpdate[]>([]);

  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws/board",
      onConnect: () => {
        console.log("Connected to board WebSocket");
        client.subscribe("/topic/board", (message) => {
          try {
            const data = JSON.parse(message.body) as BoardUpdate;
            setUpdates((prev) => [...prev, data]);
            console.log("Received board update:", data);
          } catch (error) {
            console.error("Error parsing board update:", error);
          }
        });
      },
      onStompError: (frame) => {
        console.error("WebSocket error:", frame.headers.message);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);
const sendBoardUpdate = (update: BoardUpdate) => {
  const client = new Client({
    brokerURL: "ws://localhost:8080/ws/board",
  });

  client.onConnect = () => {
    client.publish({
      destination: "/app/board/update",
      body: JSON.stringify(update),
    });
    client.deactivate();
  };

  client.activate();
};
  return updates;
};