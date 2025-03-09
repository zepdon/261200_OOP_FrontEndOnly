"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import BuyMinion from "./BuyMinion";
import styles from "./Hex.module.css";

const HEX_RADIUS = 40;
const COLS = 8;
const ROWS = 8;
const HEX_WIDTH = 2 * HEX_RADIUS;
const HEX_HEIGHT = Math.sqrt(3) * HEX_RADIUS;

interface HexGridProps {
  canAct: boolean;
  initialBlueHexes?: string[];
  initialRedHexes?: string[];
}

const HexGrid: React.FC<HexGridProps> = ({
  canAct,
  initialBlueHexes = ["(1,1)", "(1,2)", "(2,1)", "(2,2)", "(1,3)"],
  initialRedHexes = ["(7,7)", "(7,8)", "(8,6)", "(8,7)", "(8,8)"],
}) => {
  const [locked, setLocked] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [goldBlue, setGoldBlue] = useState(10000); // เงินของ Player 1 (Blue)
  const [goldRed, setGoldRed] = useState(10000); // เงินของ Player 2 (Red)
  const [selectedMinion, setSelectedMinion] = useState<null | { id: number; name: string; src: string }>(null);
  const [selectedHexes, setSelectedHexes] = useState<Record<string, string>>({});
  const [minionPositions, setMinionPositions] = useState<Record<string, { id: number; src: string; owner: "blue" | "red"; atk: number; def: number; hp: number }>>({});
  const [pendingHex, setPendingHex] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<"blue" | "red">("blue");
  const [turnCount, setTurnCount] = useState(1);
  const [highlightedHexes, setHighlightedHexes] = useState<Record<string, string>>({});
  const [hasPlacedMinion, setHasPlacedMinion] = useState(false);
  const [isBuyingHex, setIsBuyingHex] = useState(false);
  const [hasBoughtHex, setHasBoughtHex] = useState(false);
  const [selectedMinionInfo, setSelectedMinionInfo] = useState<{ id: number; owner: "blue" | "red"; atk: number; def: number; hp: number } | null>(null);

  const minions = [
    { id: 1, src: "/image/Minion/minion1.png", name: "Minion 1", price: 1000 },
    { id: 2, src: "/image/Minion/minion2.png", name: "Minion 2", price: 1500 },
    { id: 3, src: "/image/Minion/minion3.png", name: "Minion 3", price: 2000 },
    { id: 4, src: "/image/Minion/minion4.png", name: "Minion 4", price: 2500 },
    { id: 5, src: "/image/Minion/minion5.png", name: "Minion 5", price: 3000 },
  ];

  const handleBuyMinion = (minionId: number) => {
    const minion = minions.find(m => m.id === minionId);
    if (minion) {
      if (currentTurn === "blue" && goldBlue >= minion.price) {
        //setGoldBlue(prev => prev - minion.price); // หักเงิน Player 1
        setSelectedMinion(minion);
        setIsPopupOpen(false);
      } else if (currentTurn === "red" && goldRed >= minion.price) {
        //setGoldRed(prev => prev - minion.price); // หักเงิน Player 2
        setSelectedMinion(minion);
        setIsPopupOpen(false);
      } else {
        alert("คุณมีเงินไม่เพียงพอ!");
      }
    }
  };

  const handlePlaceMinion = (hexKey: string) => {
    if (selectedMinion) {
      const minion = minions.find(m => m.id === selectedMinion.id);
      if (minion) {
        if (currentTurn === "blue" && goldBlue >= minion.price) {
          setGoldBlue(prev => prev - minion.price); // หักเงิน Player 1
        } else if (currentTurn === "red" && goldRed >= minion.price) {
          setGoldRed(prev => prev - minion.price); // หักเงิน Player 2
        } else {
          alert("คุณมีเงินไม่เพียงพอ!");
          return;
        }
        alert(`Spawned ${selectedMinion.name} at ${hexKey}`);
        setSelectedMinion(null);
      }
    }
  };

  const getColor = (turn: "blue" | "red") => (turn === "blue" ? "#3498db" : "#e74c3c");

  const calculateAdjacentHexes = (
    currentHexes: Record<string, string>,
    currentColor: "blue" | "red"
  ) => {
    const adjacentHexes: Record<string, string> = {};
    const targetColor = currentColor === "blue" ? "#3498db" : "#e74c3c";
    const adjacentColor = "#F4D03F"; // สีเหลืองสำหรับช่องที่สามารถซื้อได้

    Object.entries(currentHexes).forEach(([hex, color]) => {
      if (color !== targetColor) return;

      const match = hex.match(/\((\d+),(\d+)\)/);
      if (!match) return;

      const [_, rowStr, colStr] = match;
      const row = parseInt(rowStr, 10);
      const col = parseInt(colStr, 10);

      const directions = col % 2 === 0
        ? [[-1, 0], [-1, 1], [0, 1], [1, 0], [0, -1], [-1, -1]]
        : [[-1, 0], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];

      directions.forEach(([dr, dc]) => {
        const adjRow = row + dr;
        const adjCol = col + dc;
        const adjKey = `(${adjRow},${adjCol})`;

        if (
          adjRow > 0 && adjRow <= ROWS &&
          adjCol > 0 && adjCol <= COLS &&
          !currentHexes[adjKey] // ต้องไม่มีสีใด ๆ เลย
        ) {
          adjacentHexes[adjKey] = adjacentColor;
        }
      });
    });

    return adjacentHexes;
  };
  

  useEffect(() => {
    const initialBlue: Record<string, string> = Object.create(null);
    initialBlueHexes.forEach(key => (initialBlue[key] = "#3498db"));
    const initialRed: Record<string, string> = Object.create(null);
    initialRedHexes.forEach(key => (initialRed[key] = "#e74c3c"));
    setSelectedHexes({ ...initialBlue, ...initialRed });
  }, []);

  useEffect(() => {
    if (isBuyingHex) {
      const adjacentHexes = calculateAdjacentHexes(selectedHexes, currentTurn);
      setHighlightedHexes(adjacentHexes);
    } else {
      setHighlightedHexes({});
    }
  }, [selectedHexes, currentTurn, isBuyingHex]);

  const handleHexClick = (row: number, col: number) => {
    if (!canAct || locked) return;
    const key = `(${row},${col})`;
  
    if (isBuyingHex) {
      if (key in highlightedHexes) {
        // ตรวจสอบเงินของผู้เล่นที่กำลังเล่นเทิร์น
        const currentGold = currentTurn === "blue" ? goldBlue : goldRed;
        if (currentGold >= 1000) {
          setSelectedHexes(prev => ({
            ...prev,
            [key]: getColor(currentTurn),
          }));
          setIsBuyingHex(false);
          setHasBoughtHex(true);
          setHighlightedHexes({});
          // หักเงินของผู้เล่นที่กำลังเล่นเทิร์น
          if (currentTurn === "blue") {
            setGoldBlue(prevGold => prevGold - 500);
          } else {
            setGoldRed(prevGold => prevGold - 500);
          }
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
        owner: currentTurn,
        atk: 5,
        def: 5,
        hp: 100
      };
      setMinionPositions(prev => ({
        ...prev,
        [key]: newMinion,
      }));
  
      // ตรวจสอบเงินของผู้เล่นที่กำลังเล่นเทิร์น
      const minion = minions.find(m => m.id === selectedMinion.id);
      if (minion) {
        const currentGold = currentTurn === "blue" ? goldBlue : goldRed;
        if (currentGold >= minion.price) {
          // หักเงินของผู้เล่นที่กำลังเล่นเทิร์น
          if (currentTurn === "blue") {
            setGoldBlue(prevGold => prevGold - minion.price);
          } else {
            setGoldRed(prevGold => prevGold - minion.price);
          }
          alert(`Spawned ${selectedMinion.name} at ${key}`);
          setSelectedMinion(null); // รีเซ็ตมินเนียนที่เลือก
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

  const handleEndTurn = () => {
    setCurrentTurn(prev => (prev === "blue" ? "red" : "blue"));
    setTurnCount(prev => prev + 1);
    setLocked(false);
    setPendingHex(null);
    setHasPlacedMinion(false);
    setHasBoughtHex(false);
    setHighlightedHexes({});
  };

  const handleCloseStatus = () => {
    setSelectedMinionInfo(null);
  };

  const hexagons: React.ReactElement[] = [];
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
        <div style={{ position: "fixed", top: '15%', right: '10%' }}>
          <div className={styles.button} onClick={() => setIsPopupOpen(true)}>
            Buy Minion
          </div>
        </div>
        {isPopupOpen && (
        <BuyMinion
          onClose={() => setIsPopupOpen(false)}
          onBuy={handleBuyMinion}
          gold={currentTurn === "blue" ? goldBlue : goldRed} // ส่งเงินของผู้เล่นที่กำลังเล่นเทิร์น
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
          {currentTurn === "blue" ? goldBlue : goldRed} {/* แสดงเงินของผู้เล่นที่กำลังเล่นเทิร์น */}
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
          backgroundColor: turnCount >= 3 && !hasBoughtHex ? "white" : "gray",
          color: "black",
          border: "none",
          borderRadius: "8px",
          cursor: turnCount >= 3 && !hasBoughtHex ? "pointer" : "not-allowed",
        }}
        onClick={() => {
          if (turnCount >= 3) {
            setIsBuyingHex(true);
            highlightedHexes
          }
        }}
        disabled={turnCount < 3 || hasBoughtHex}
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
          backgroundColor: "white",
          color: "black",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        onClick={handleEndTurn}
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
          <p>ATK: {selectedMinionInfo.atk}</p>
          <p>DEF: {selectedMinionInfo.def}</p>
        </div>
      )}
    </div>
  );
};

export default HexGrid;