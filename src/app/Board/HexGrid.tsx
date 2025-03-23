"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import BuyMinion from "./BuyMinion";
import styles from "./Hex.module.css";
import { webSocketService } from "../../services/websocket";
import { stdout } from "process";

// Define interfaces
interface HexGridProps {
  canAct: boolean;
}

interface BoardUpdate {
  row: number;
  col: number;
  player: "blue" | "red";
  action: "placeMinion" | "buyHex";
  minion?: {
    id: number;
    src: string;
    def: number;
    hp: number;
  };
}

interface Minion {
  id: number;
  name: string;
  price: number;
  hp: number;
  def: number;
  owner: "blue" | "red";
  src: string; // Path to the minion image
  row: number; // Current row position
  col: number; // Current column position
}
interface minionupdate{
  row: number;
  col: number;
  typeNumber: number;
  hp:number;
  defenceFactor:number;
  src:string;
  owner: "blue" | "red";
}

type Player = "blue" | "red";

// Constants for hex grid
const HEX_RADIUS = 40;
const COLS = 8;
const ROWS = 8;
const HEX_WIDTH = 2 * HEX_RADIUS;
const HEX_HEIGHT = Math.sqrt(3) * HEX_RADIUS;

// Helper function to get player color
const getColor = (turn: "blue" | "red") => (turn === "blue" ? "#3498db" : "#e74c3c");


const HexGrid: React.FC<HexGridProps> = ({ canAct }) => {
  // State variables
  const [minionPositions, setMinionPositions] = useState<
    Record<string, { id: number; src: string; owner: Player;  def: number; hp: number }>
  >({});
  const [locked, setLocked] = useState(false);
  const [selectedHexes, setSelectedHexes] = useState<Record<string, string>>({});
  const [selectedMinion, setSelectedMinion] = useState<Minion | null>(null);
  const [currentTurn, setCurrentTurn] = useState<Player>("blue");
  const [isBuyingHex, setIsBuyingHex] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [goldBlue, setGoldBlue] = useState(0);
  const [goldRed, setGoldRed] = useState(0);
  const [turnCount, setTurnCount] = useState(1);
  const [hasBoughtHex, setHasBoughtHex] = useState(false);
  const [highlightedHexes, setHighlightedHexes] = useState<Record<string, string>>({});
  const [hasPlacedMinion, setHasPlacedMinion] = useState(false);
  const [pendingHex, setPendingHex] = useState<string | null>(null);
  const [selectedMinionInfo, setSelectedMinionInfo] = useState<{
    id: number;
    owner: Player;
    def: number;
    hp: number;
  } | null>(null);
  const [indexminiontosent, setindexminiontosent] = useState<{
    id: number;
    row: number;
    col: number;
  } | null>(null);
  const [showCount,setshowCount] = useState<number>(0);
  const [mode,setMode] = useState<number>(3);

  // Minions data
  const [minions, setMinions] = useState<Minion[]>([
    {
      id: 1, name: "Minion 1", price: 1000, hp: 100, def: 5, owner: "blue", src: "/image/Minion/minion1.png",
      row: -1, col: -1,
    },
    {
      id: 2, name: "Minion 2", price: 1000, hp: 100, def: 6, owner: "blue", src: "/image/Minion/minion2.png",
      row: -1, col: -1,
    },
    {
      id: 3, name: "Minion 3", price: 1000, hp: 100, def: 4, owner: "blue", src: "/image/Minion/minion3.png",
      row: -1, col: -1,
    },
    {
      id: 4, name: "Minion 4", price: 1000, hp: 100, def: 5, owner: "blue", src: "/image/Minion/minion4.png",
      row: -1, col: -1,
    },
    {
      id: 5, name: "Minion 5", price: 1000, hp: 100, def: 7, owner: "blue", src: "/image/Minion/minion5.png",
      row: -1, col: -1,
    },
  ]);
  const [minionupdate, setMinionupdate] = useState<minionupdate[]>([
    // { row: 7, col: 8, typeNumber: 1, hp: 100, defenceFactor: 2, src: "/image/Minion/minion1.png" ,owner: "blue"},
    // { row: 7, col: 7, typeNumber: 2, hp: 50, defenceFactor: 2, src: "/image/Minion/minion2.png", owner:"red"},
    // { row: 1, col: 2, typeNumber: 2, hp: 100, defenceFactor: 2, src: "/image/Minion/minion3.png" ,owner:"red"}
  ]);
  const updateMinionPositionsFromMinionUpdate = () => {
    const updatedPositions: Record<string, Minion> = {};
  
    minionupdate.forEach((minion) => {
      const key = `(${minion.row},${minion.col})`;
      updatedPositions[key] = {
        id: minion.typeNumber, // ใช้ typeNumber เป็น id
        name: `Minion ${minion.typeNumber}`,
        price: 1000, // กำหนดค่า price ตามต้องการ
        hp: minion.hp,
        def: minion.defenceFactor,
        owner: minion.owner, // ใช้ currentTurn เป็น owner
        src: minion.src,
        row: minion.row,
        col: minion.col,
      };
    });
  
    // อัปเดต minionPositions
    setMinionPositions(updatedPositions);
  };
  
  // Function to update the current turn
  const updateTurn = () => {
    setCurrentTurn(turnCount % 2 === 1 ? "blue" : "red");
  };

  // Function to handle buying a minion
  const handleBuyMinion = (minionId: number) => {
    const minion = minions.find((m) => m.id === minionId);
    if (minion) {
      if (currentTurn === "blue" && goldBlue >= minion.price) {
        setSelectedMinion(minion); // Select the minion
        setIsPopupOpen(false); // Close the popup
      } else if (currentTurn === "red" && goldRed >= minion.price) {
        setSelectedMinion(minion);
        setIsPopupOpen(false);
      } else {
        alert("คุณมีเงินไม่เพียงพอ!");
      }
    }
  };

  useEffect(() => {
    const handleMessage = (update: BoardUpdate) => {
      console.log("Received update:", update);
      const { row, col, player, action, minion } = update;
      const key = `(${row},${col})`;

      if (action === "placeMinion" && minion) {
        setMinionPositions((prev) => ({
          ...prev,
          [key]: { ...minion, owner: player },
        }));
      } else if (action === "buyHex") {
        setSelectedHexes((prev) => ({
          ...prev,
          [key]: player === "blue" ? "#3498db" : "#e74c3c",
        }));
      }
    };

    const handlePlayer1Hexes = (hexes: string[]) => {
      console.log("Received player 1 hexes:", hexes);
      setSelectedHexes((prev) => {
        const newHexes = { ...prev };
        hexes.forEach((hexKey) => {
          newHexes[hexKey] = "#3498db"; // Blue color
        });
        console.log("Updated selectedHexes:", newHexes);
        return newHexes;
      });
    };

    const handlePlayer2Hexes = (hexes: string[]) => {
      console.log("Received player 2 hexes:", hexes);
      setSelectedHexes((prev) => {
        const newHexes = { ...prev };
        hexes.forEach((hexKey) => {
          newHexes[hexKey] = "#e74c3c"; // Red color
        });
        console.log("Updated selectedHexes:", newHexes);
        return newHexes;
      });
    };

    const handlePlayer1Budget = (budget: number) => {
      console.log("Received player 1 budget:", budget);
      setGoldBlue(budget); // Update player 1's budget
    };

    const handlePlayer2Budget = (budget: number) => {
      console.log("Received player 2 budget:", budget);
      setGoldRed(budget); // Update player 2's budget
    };

    const handleCurrentTurn = (turn: number) => {
      console.log("Received current turn:", turn);
      setTurnCount(turn); // Update turn count
      
    };

    const handleMinionType = (type: number) => {
      console.log("Received minion type:", type);
      setshowCount(type); // Update minions count
    };

    const handleMinionName = (allminion: string[]) => {
      console.log("Received minion name:", allminion);
      setMinions((prevMinions) =>
        prevMinions.map((minion, index) => ({
          ...minion,
          name: allminion[index] || minion.name, // Use the new name if available, otherwise keep the old name
        }))
      );
    };
    const handleMinionDefence = (MinionDefence: number[]) => {
      console.log("Received minion Defence:", MinionDefence);
    
      // Update the minions state with the new defense values
      setMinions((prevMinions) =>
        prevMinions.map((minion, index) => ({
          ...minion,
          def: MinionDefence[index] || minion.def, // Use the new defense value if available, otherwise keep the old value
        }))
      );
    };
    const handleMinionData = (minionData: string[][]) => {
      
      // Convert the data into the minionupdate format
      const updatedMinions: minionupdate[] = minionData.map((minion) => ({
        row: parseInt(minion[0], 10), // Convert row to number
        col: parseInt(minion[1], 10), // Convert col to number
        typeNumber: parseInt(minion[2], 10), // Convert typeNumber to number
        hp: parseInt(minion[3], 10), // Convert hp to number
        defenceFactor: parseInt(minion[4], 10), // Convert defenceFactor to number
        src: minion[5], // src is already a string
        owner: minion[6] as "blue" | "red", // owner is already a string, but cast to "blue" | "red"
      }));
      console.log("Received minion data:",updatedMinions);
      // Update the minionupdate state
      setMinionupdate(updatedMinions);
      
    };
    const handleGameMode = (gameMode: number) => {
      console.log("Received game mode:", gameMode);
      setMode(gameMode); // Update game mode
    };

    // Request player-owned hexes and budgets when the component mounts
    webSocketService.requestPlayerHexes();
    
    // Connect to WebSocket and set up subscriptions
    webSocketService.connect(
      handleMessage,
      handlePlayer1Hexes,
      handlePlayer2Hexes,
      handlePlayer1Budget,
      handlePlayer2Budget,
      handleCurrentTurn,
      handleMinionType,
      handleMinionName,
      handleMinionDefence,
      handleMinionData,
      handleGameMode
    );

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  // Handle placing a minion
  const handlePlaceMinion = (hexKey: string) => {
    if (selectedMinion) {
      const minion = minions.find((m) => m.id === selectedMinion.id);
      if (minion) {
        if (currentTurn === "blue" && goldBlue >= minion.price) {
          setGoldBlue((prev) => prev - minion.price); // Deduct gold from Player 1
        } else if (currentTurn === "red" && goldRed >= minion.price) {
          setGoldRed((prev) => prev - minion.price); // Deduct gold from Player 2
        } else {
          alert("คุณมีเงินไม่เพียงพอ!");
          return;
        }
        alert(`Spawned ${selectedMinion.name} at ${hexKey}`);
        console.log("use handlePlaceMinion function");
        setSelectedMinion(null); // Reset selected minion
      }
    }
  };

  // Handle buying a hex
  const handleBuyHex = (hexKey: string) => {
    const [row, col] = hexKey.slice(1, -1).split(",").map(Number);
    const update: BoardUpdate = {
      row,
      col,
      player: currentTurn,
      action: "buyHex",
    };
    webSocketService.sendUpdate(update);

    // Update local state
    setSelectedHexes((prev) => ({
      ...prev,
      [hexKey]: currentTurn === "blue" ? "#3498db" : "#e74c3c",
    }));
    setHasBoughtHex(true);
  };
  const calculateAdjacentHexes = (
    currentHexes: Record<string, string>, // ข้อมูล Hex ที่มีสีอยู่
    currentColor: "blue" | "red" // สีของผู้เล่น
  ) => {
    const adjacentHexes: Record<string, string> = {}; //ใช้เก็บช่องที่สามารถซื้อได้
    const targetColor = currentColor === "blue" ? "#3498db" : "#e74c3c"; //กำหนดสีของผู้เล่นที่กำลังตรวจสอบ
    const adjacentColor = "#F4D03F"; // สีเหลืองสำหรับช่องที่สามารถซื้อได้
  
    Object.entries(currentHexes).forEach(([hex, color]) => { //วนลูปเช็ค Hex ที่มีสีอยู่
      if (color !== targetColor) return;
  
      const match = hex.match(/\((\d+),(\d+)\)/);
      if (!match) return;
  
      const [_, rowStr, colStr] = match;
      const row = parseInt(rowStr, 10);
      const col = parseInt(colStr, 10);
      
      const directions = col % 2 === 0 //หาทิศทางของ Hex ที่อยู่ติดกัน
        ? [[-1, 0], [-1, 1], [0, 1], [1, 0], [0, -1], [-1, -1]]
        : [[-1, 0], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
  
      directions.forEach(([dr, dc]) => { //วนลูปเช็คแต่ละช่องที่อยู่รอบๆ
        const adjRow = row + dr;
        const adjCol = col + dc;
        const adjKey = `(${adjRow},${adjCol})`; //สร้าง key ใหม่เพื่อเช็คว่ามีสีอยู่หรือไม่
  
        if ( //เช็คว่า Hex ที่อยู่รอบ ๆ สามารถซื้อได้หรือไม่
          adjRow > 0 && adjRow <= ROWS &&
          adjCol > 0 && adjCol <= COLS &&
          !currentHexes[adjKey] // ต้องไม่มีเจ้าของอยู่
        ) {
          adjacentHexes[adjKey] = adjacentColor;
        }
      });
    });
  
    return adjacentHexes;
  };
  
  useEffect(() => { // คำนวณ Hex ที่สามารถซื้อได้เมื่ออยู่ในโหมดซื้อ Hex
    if (isBuyingHex) {
      const adjacentHexes = calculateAdjacentHexes(selectedHexes, currentTurn);
      setHighlightedHexes(adjacentHexes);
    } else {
      setHighlightedHexes({});
    }
  }, [selectedHexes, currentTurn, isBuyingHex]);
  // Handle hex click
  const handleHexClick = (row: number, col: number) => {
    if (!canAct || locked) return;
    const key = `(${row},${col})`;
  
    if (isBuyingHex) {
      if (key in highlightedHexes) {
        const currentGold = currentTurn === "blue" ? goldBlue : goldRed;
        if (currentGold >= 500) {
          setSelectedHexes((prev) => ({
            ...prev,
            [key]: getColor(currentTurn),
          }));
          setIsBuyingHex(false);
          setHasBoughtHex(true);
          setHighlightedHexes({});
          if (currentTurn === "blue") {
            setGoldBlue((prevGold) => prevGold - 500);
          } else {
            setGoldRed((prevGold) => prevGold - 500);
          }
  
          // Set pending hex for turn data
          setPendingHex(key);
        } else {
          alert("คุณมีเงินไม่เพียงพอ!");
        }
      }
      return;
    }
  
    const isPlayerHex = selectedHexes[key] === getColor(currentTurn);
  
    if (selectedMinion && isPlayerHex) {
      if (hasPlacedMinion) {
        alert("คุณสามารถลงมินเนียนได้เพียง 1 ตัวต่อเทิร์น!");
        return;
      }
      const newMinion = {
        ...selectedMinion,
         // ใช้ nextMinionId เป็น id ของมินเนี่ยนใหม่
        owner: currentTurn,
      };
      setMinionPositions((prev) => ({
        ...prev,
        [key]: newMinion,
      }));
  
      const minion = minions.find((m) => m.id === selectedMinion.id);
      if (minion) {
        const currentGold = currentTurn === "blue" ? goldBlue : goldRed;
        if (currentGold >= minion.price) {
          if (currentTurn === "blue") {
            setGoldBlue((prevGold) => prevGold - minion.price);
          } else {
            setGoldRed((prevGold) => prevGold - minion.price);
          }
          alert(`Spawned ${selectedMinion.name} at ${key}`);
          setSelectedMinion(null);
  
          // Set minion data for turn data
          setindexminiontosent({ 
            id: selectedMinion.id, 
            row, 
            col 
          });
        } else {
          alert("คุณมีเงินไม่เพียงพอ!");
          return;
        }
      }
      setHasPlacedMinion(true);
      return;
    }
  
    if (minionPositions[key]) {
      setSelectedMinionInfo(minionPositions[key]);
    }
  };

  // Handle ending the turn
  useEffect(() => {
    // Update minion positions whenever minionupdate changes
    updateMinionPositionsFromMinionUpdate();
  }, [minionupdate]); // Trigger this effect when minionupdate changes
  
  const handleEndTurn = () => {
    // Gather the necessary data for the turn
    const turnData = {
      minionRow: indexminiontosent?.row || -1, // Use -1 if no minion is placed
      minionCol: indexminiontosent?.col || -1, // Use -1 if no minion is placed
      hexRow: pendingHex ? parseInt(pendingHex.match(/\((\d+),(\d+)\)/)![1], 10) : -1, // Use -1 if no hex is bought
      hexCol: pendingHex ? parseInt(pendingHex.match(/\((\d+),(\d+)\)/)![2], 10) : -1, // Use -1 if no hex is bought
      typeIndex: indexminiontosent?.id || -1, // Use the minion's ID as typeIndex
    };
  
    // Send the turn data to the backend
    webSocketService.publish("/app/board/perform-turn", JSON.stringify(turnData));
    setCurrentTurn(prev => (prev === "blue" ? "red" : "blue"));
  
    // Reset states and update the turn
    setLocked(false); // Unlock the board
    setPendingHex(null); // Reset pending hex
    setHasPlacedMinion(false); // Reset minion placement status
    setHasBoughtHex(false); // Reset hex purchase status
    setHighlightedHexes({}); // Reset highlighted hexes
    setindexminiontosent(null); // Reset minion data
  };

  // Handle closing the minion status popup
  const handleCloseStatus = () => {
    setSelectedMinionInfo(null);
  };

  // Generate hexagons
  const hexagons: JSX.Element[] = [];
  for (let row = 1; row <= ROWS; row++) {
    for (let col = 1; col <= COLS; col++) {
      const x = (col - 1) * HEX_WIDTH * 0.75;
      const y = (row - 1) * HEX_HEIGHT + (col % 2 === 1 ? HEX_HEIGHT / 2 : 0);
      const key = `(${row},${col})`;
      const fillColor = selectedHexes[key] || highlightedHexes[key] || "none";
      const minion = minionPositions[key];

      hexagons.push(
        <g key={key} transform={`translate(${x},${y})`}>
          <polygon
            points={`
              ${HEX_RADIUS * 0.5},0 
              ${HEX_RADIUS * 1.5},0 
              ${HEX_RADIUS * 2},${HEX_HEIGHT / 2} 
              ${HEX_RADIUS * 1.5},${HEX_HEIGHT} 
              ${HEX_RADIUS * 0.5},${HEX_HEIGHT} 
              0,${HEX_HEIGHT / 2}
            `}
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="2"
            fill={fillColor}
            style={{
              pointerEvents: "all",
              cursor: key in highlightedHexes || selectedMinion ? "pointer" : "default",
            }}
            onClick={() => handleHexClick(row, col)}
          />
          {minion && (
            <image
              href={minion.src}
              x={HEX_RADIUS * 0.1}
              y={HEX_HEIGHT * -0.2}
              width={HEX_RADIUS * 1.5}
              height={HEX_HEIGHT * 1.5}
              onClick={() => setSelectedMinionInfo(minion)}
            />
          )}
        </g>
      );
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: 'fixed', top: '5%', left: '3%', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Image
          src="/image/profile/profile.png"
          alt="Profile Image"
          width={100}
          height={100}
        />
         <button
           style={{ 
             position: "fixed", 
             top: '15%', 
             right: '10%',
             borderRadius: "8px",
             fontSize: "1.5rem",
             cursor: mode === 2 && currentTurn === "red" || mode === 3 ? "not-allowed" : "pointer"
           }}
           onClick={() => setIsPopupOpen(true)}
           disabled={
             mode === 2 && currentTurn === "red" || // ถ้า mode เท่ากับ 2 และเป็นเทิร์นฝั่งสีแดง
             mode === 3 // ถ้า mode เท่ากับ 3
           }
         >
           Buy Minion
         </button>
        {isPopupOpen && (
          <BuyMinion
            onClose={() => setIsPopupOpen(false)}
            onBuy={handleBuyMinion}
            gold={currentTurn === "blue" ? goldBlue : goldRed} // Send current player's gold
            showCount={showCount}
            minions={minions} // Pass the minions array with updated names
          />
        )}
        <h1>Player1</h1>
      </div>
      <div style={{ position: 'fixed', bottom: '5%', right: '3%', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1>Player2</h1>
        <Image
          src="/image/profile/profile.png"
          alt="Profile Image"
          width={100}
          height={100}
        />
      </div>
      <div style={{ position: 'fixed', bottom: '5%', left: '3%', display: 'flex', alignItems: 'end', gap: '10px' }}>
        <Image
          src="/image/icon/money-bag 1.png"
          alt="money"
          width={100}
          height={100}
        />
        <h1 style={{ color: '#f4d03f' }}>
          {currentTurn === "blue" ? goldBlue : goldRed} {/* Show current player's gold */}
        </h1>
      </div>
      <svg
        width={(COLS * HEX_WIDTH * 0.75) + HEX_RADIUS}
        height={(ROWS * HEX_HEIGHT) + (HEX_HEIGHT / 2)}
        viewBox={`0 0 ${(COLS * HEX_WIDTH * 0.75) + HEX_RADIUS} ${(ROWS * HEX_HEIGHT) + (HEX_HEIGHT / 2)}`}
        style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        {hexagons}
      </svg>
      <button
        style={{
          position: "fixed",
          top: "28%",
          left: "6%",
          fontSize: "1.5rem",
          fontWeight: "bold",
          backgroundColor:
          (mode === 1 && (turnCount < 3 || hasBoughtHex)) || // Mode 1: Turns 1-2 or hasBoughtHex
          (mode === 2 && (turnCount < 3 || currentTurn === "red" || hasBoughtHex)) || // Mode 2: Turns 1-2, Red's turn, or hasBoughtHex
          (mode === 3) // Mode 3: Always disabled
            ? "gray" // Disabled
            : "white", // Enabled
          color: "black",
          border: "none",
          borderRadius: "8px",
          cursor:
          (mode === 1 && (turnCount < 3 || hasBoughtHex)) || // Mode 1: Turns 1-2 or hasBoughtHex
          (mode === 2 && (turnCount < 3 || currentTurn === "red" || hasBoughtHex)) || // Mode 2: Turns 1-2, Red's turn, or hasBoughtHex
          (mode === 3) // Mode 3: Always disabled
            ? "not-allowed" 
            : "pointer",
        }}
        onClick={() => {
          if (turnCount >= 3 && !hasBoughtHex) { // Ensure the button is only clickable when conditions are met
            setIsBuyingHex(true);
            setHighlightedHexes({}); // Ensure the state updates correctly
          }
        }}
        disabled={
          (mode === 1 && (turnCount < 3 || hasBoughtHex)) || // Mode 1: Turns 1-2 or hasBoughtHex
          (mode === 2 && (turnCount < 3 || currentTurn === "red" || hasBoughtHex)) || // Mode 2: Turns 1-2, Red's turn, or hasBoughtHex
          (mode === 3) // Mode 3: Always disabled
        }
      >
        Buy Hex
      </button>
      <button
        style={{
          position: "fixed",
          top: "35%",
          left: "6%",
          fontSize: "1.5rem",
          fontWeight: "bold",
          backgroundColor: 
          mode === 1 && turnCount < 3 && !hasPlacedMinion || // ถ้าเงื่อนไขเป็นจริง
          mode === 2 && turnCount < 2 && !hasPlacedMinion    // ถ้าเงื่อนไขเป็นจริง
          ? "gray" // ตั้งค่า background เป็นสีเทา
          : "white", // ตั้งค่า background เป็นสีขาว
          color: "black",
          border: "none",
          borderRadius: "8px",
          cursor:
          mode === 1 && turnCount < 3 && !hasPlacedMinion || // ถ้าเงื่อนไขเป็นจริง
          mode === 2 && turnCount < 2 && !hasPlacedMinion    // ถ้าเงื่อนไขเป็นจริง
            ? "not-allowed" // ตั้งค่า cursor เป็น "not-allowed"
            : "pointer", // ตั้งค่า cursor เป็น "pointer"
        }}
        onClick={handleEndTurn}
        disabled={
          mode === 1 && turnCount < 3 ? !hasPlacedMinion : false ||
          mode === 2 && turnCount < 2 ? !hasPlacedMinion : false
          }
      >
        Done
      </button>
      <div
        style={{
          position: "fixed",
          top: "5%",
          right: "15%",
          padding: "10px 20px",
          fontSize: "1.5rem",
          backgroundColor: "#34495e",
          color: "white",
          borderRadius: "8px",
        }}
      >
        Turn Count: {turnCount}
      </div>
      <div
        style={{
          position: "fixed",
          top: "5%",
          right: "5%",
          padding: "10px 20px",
          fontSize: "1.5rem",
          backgroundColor: "#34495e",
          color: "white",
          borderRadius: "8px",
        }}
      >
        {currentTurn} Turn
      </div>
      {selectedMinionInfo && (
        <div
          style={{
            position: "fixed",
            bottom: "25%",
            left: "5%",
            padding: "10px 30px",
            fontSize: "1rem",
            backgroundColor: "#222",
            color: "white",
            borderRadius: "8px",
          }}
        >
          <button
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              backgroundColor: "transparent",
              border: "none",
              color: "red",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            onClick={handleCloseStatus}
          >
            X
          </button>
          <p style={{ fontWeight: "bold" }}>Minion status</p>
          <p>Owner: {selectedMinionInfo.owner}</p>
          <p>HP: {selectedMinionInfo.hp}</p>
          <p>DEF: {selectedMinionInfo.def}</p>
          
        </div>
      )}
    </div>
  );
};

export default HexGrid;