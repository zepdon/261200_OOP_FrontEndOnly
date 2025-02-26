"use client";
import React, { useState, useEffect } from "react";

const HEX_RADIUS = 40;
const COLS = 8;
const ROWS = 8;
const HEX_WIDTH = 2 * HEX_RADIUS;
const HEX_HEIGHT = Math.sqrt(3) * HEX_RADIUS;

interface HexGridProps {
  canAct: boolean;
  locked: boolean;
  setLocked: React.Dispatch<React.SetStateAction<boolean>>;
  initialBlueHexes?: string[];
  initialRedHexes?: string[];
  selectedMinion: null | { id: number; name: string; src: string };
  onPlaceMinion: (hexKey: string) => void;
}

const HexGrid: React.FC<HexGridProps> = ({
  canAct,
  locked,
  setLocked,
  initialBlueHexes = ["(1,1)", "(1,2)", "(2,1)", "(2,2)", "(1,3)"],
  initialRedHexes = ["(7,7)", "(7,8)", "(8,6)", "(8,7)", "(8,8)"],
  selectedMinion,
  onPlaceMinion
}) => {
  const [selectedHexes, setSelectedHexes] = useState<Record<string, string>>({});
  const [minionPositions, setMinionPositions] = useState<Record<string, { id: number; src: string; owner: "blue" | "red" }>>({});  
  const [pendingHex, setPendingHex] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<"blue" | "red">("blue");
  const [turnCount, setTurnCount] = useState(1);
  const [highlightedHexes, setHighlightedHexes] = useState<Record<string, string>>({});

  const getColor = (turn: "blue" | "red") => (turn === "blue" ? "#3498db" : "#e74c3c");

  const getValidDirections = (row: number, col: number): [number, number][] => {
    const isEvenRow = row % 2 === 0;
    return isEvenRow
      ? [[-1, 0], [-1, 1], [0, 1], [1, 0], [0, -1], [-1, -1]]
      : [[-1, 0], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
  };

  const highlightAvailableMoves = (turn: "blue" | "red") => {
    if (turnCount < 3 || pendingHex) {
      setHighlightedHexes({});
      return;
    }
    const adjacent: Record<string, string> = {};
    Object.keys(selectedHexes).forEach(hex => {
      if (selectedHexes[hex] === getColor(turn)) {
        const match = hex.match(/\((\d+),(\d+)\)/);
        if (match) {
          const row = parseInt(match[1], 10);
          const col = parseInt(match[2], 10);
          getValidDirections(row, col).forEach(([dr, dc]) => {
            const adjRow = row + dr;
            const adjCol = col + dc;
            const adjKey = `(${adjRow},${adjCol})`;
            if (
              adjRow > 0 && adjRow <= ROWS &&
              adjCol > 0 && adjCol <= COLS &&
              !(adjKey in selectedHexes) && !(adjKey in highlightedHexes)
            ) {
              adjacent[adjKey] = "#F4D03F";
            }
          });
        }
      }
    });
    setHighlightedHexes(adjacent);
  };

  useEffect(() => {
    const initialBlue: Record<string, string> = Object.create(null);
    initialBlueHexes.forEach(key => (initialBlue[key] = "#3498db"));
    const initialRed: Record<string, string> = Object.create(null);
    initialRedHexes.forEach(key => (initialRed[key] = "#e74c3c"));
    setSelectedHexes({ ...initialBlue, ...initialRed });
  }, []);

  useEffect(() => {
    highlightAvailableMoves(currentTurn);
  }, [selectedHexes, currentTurn]);

  const handleHexClick = (row: number, col: number) => {
    if (!canAct || locked) return; 
    const key = `(${row},${col})`;
  
    const isPlayerHex = selectedHexes[key] === getColor(currentTurn);
  
    if (selectedMinion && isPlayerHex) {
      setMinionPositions(prev => ({
        ...prev,
        [key]: { ...selectedMinion, owner: currentTurn },
      }));
      onPlaceMinion(key);
      return;
    }
      if (key in highlightedHexes) {
      setSelectedHexes(prev => ({
        ...prev,
        [key]: getColor(currentTurn),
      }));
      setPendingHex(key);
      setLocked(true);
    }
  };

  const handleEndTurn = () => {
    setCurrentTurn(prev => (prev === "blue" ? "red" : "blue"));
    setTurnCount(prev => prev + 1);
    setLocked(false);
    setPendingHex(null);  // รีเซ็ต pendingHex เมื่อจบตา
    highlightAvailableMoves(currentTurn);  // คำนวณช่องที่สามารถคลิกได้ใหม่
  };

  const hexagons: React.ReactElement[] = [];
  for (let row = 1; row <= ROWS; row++) {
    for (let col = 1; col <= COLS; col++) {
      const x = (col - 1) * HEX_WIDTH * 0.75;
      const y = (row - 1) * HEX_HEIGHT + (col % 2 === 1 ? HEX_HEIGHT / 2 : 0);
      const key = `(${row},${col})`;
      const fillColor = selectedHexes[key] || highlightedHexes[key] || "none";
      const minion = minionPositions[key]; // ตรวจสอบว่ามีมินเนียนในช่องนี้หรือไม่

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
          {minion && ( // แสดงมินเนียนถ้ามี
            <image
              href={minion.src}
              x={HEX_RADIUS * 0.1}
              y={HEX_HEIGHT * -0.2}
              width={HEX_RADIUS * 1.5}
              height={HEX_HEIGHT * 1.5}
            />
        )}
      </g>
    );
  }
}

  return (
    <div style={{ position: "relative" }}>
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
      }}>{currentTurn} Turn</div>
    </div>
  );
};

export default HexGrid;
