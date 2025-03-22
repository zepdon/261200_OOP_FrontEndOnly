import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client"; // Import SockJS
interface BoardUpdate {
  row: number;
  col: number;
  player: "blue" | "red";
  action: "placeMinion" | "buyHex";
  minion?: { id: number; src: string;  def: number; hp: number };
}
class WebSocketService {
  public client: Client;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"), // Use SockJS
      onConnect: () => {
        console.log("Connected to WebSocket");
      },
      onStompError: (frame) => {
        console.error("WebSocket error:", frame.headers.message);
      },
      onWebSocketError: (event) => {
        console.error("WebSocket connection error:", event);
      },
      onWebSocketClose: (event) => {
        console.warn("WebSocket connection closed:", event);
      },
      debug: (message) => {
        console.log("STOMP debug:", message); // Debug logging
      },
    });
  }
  // In the WebSocketService class
requestPlayerHexes() {
  if (this.client.connected) {
    this.client.publish({
      destination: "/app/board/request-player1-hexes",
      body: JSON.stringify({}),
    });
    this.client.publish({
      destination: "/app/board/request-player2-hexes",
      body: JSON.stringify({}),
    });
    this.client.publish({
      destination: "/app/board/request-player1-budget",
      body: JSON.stringify({}),
    });
    this.client.publish({
      destination: "/app/board/request-player2-budget",
      body: JSON.stringify({}),
    });
    this.client.publish({
      destination: "/app/board/request-current-turn",
      body: JSON.stringify({}),
    });
    this.client.publish({
      destination: "/app/board/request-minion-type", 
      body: JSON.stringify({}),
    });
  } else {
    console.warn("WebSocket is not connected. Cannot request player hexes.");
  }
}
   // Subscribe to current turn
   

  connect(
    onMessage: (update: BoardUpdate) => void,
    onPlayer1Hexes: (hexes: string[]) => void,
    onPlayer2Hexes: (hexes: string[]) => void,
    handlePlayer1Budget: (budget: number) =>void,
    handlePlayer2Budget: (budget: number) => void,
    handleCurrentTurn: (turn: number) => void,
    handleMinionType: (minionType: number) => void
  ) {
    this.client.onConnect = () => {
      console.log("Connected to WebSocket");
  
      // Subscribe to board updates
      this.client.subscribe("/topic/board", (message) => {
        const update = JSON.parse(message.body) as BoardUpdate;
        onMessage(update);
      });
  
      // Subscribe to player 1 hexes
      this.client.subscribe("/topic/player1-hexes", (message) => {
        const hexes = JSON.parse(message.body) as string[];
        onPlayer1Hexes(hexes);
      });
  
      // Subscribe to player 2 hexes
      this.client.subscribe("/topic/player2-hexes", (message) => {
        const hexes = JSON.parse(message.body) as string[];
        onPlayer2Hexes(hexes);
      });
        // Subscribe to player budgets
        this.client.subscribe("/topic/player1-budget", (message) => {
          const budget = JSON.parse(message.body) as number;
          handlePlayer1Budget(budget);
        });
        this.client.subscribe("/topic/player2-budget", (message) => {
          const budget = JSON.parse(message.body) as number;
          handlePlayer2Budget(budget);
        });
        this.client.subscribe("/topic/current-turn", (message) => {
        const turn = JSON.parse(message.body) as number;
        handleCurrentTurn(turn);
        });
        this.client.subscribe("/topic/minion-type", (message) => {
        const minionType = JSON.parse(message.body) as number;
        handleMinionType(minionType);
        });
      // Request player-owned hexes after connection is established
      this.requestPlayerHexes();
    };
  
    this.client.activate();
  }
 // Add the subscribe method
 subscribe(topic: string, callback: (message: any) => void) {
  if (this.client.connected) {
    this.client.subscribe(topic, callback);
  } else {
    console.warn("WebSocket is not connected. Cannot subscribe to topic:", topic);
  }
}

publish(destination: string, body: string) {
  if (this.client.connected) {
    this.client.publish({ destination, body });
  } else {
    console.warn("WebSocket is not connected. Cannot publish message.");
  }
}
  sendUpdate(update: BoardUpdate) {
    this.client.publish({
      destination: "/app/board/update",
      body: JSON.stringify(update),
    });
  }
  disconnect() {
    this.client.deactivate();
  }
}

export const webSocketService = new WebSocketService();