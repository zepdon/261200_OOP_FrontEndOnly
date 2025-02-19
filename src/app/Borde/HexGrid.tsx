"use client";
import React, { useState, useEffect } from "react";
import BuyButton from "@components/BuyButton";

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
}

const HexGrid: React.FC<HexGridProps> = ({
  canAct,
  locked,
  setLocked,
  initialBlueHexes = ["(1,1)", "(1,2)", "(2,1)", "(2,2)", "(1,3)"],
  initialRedHexes = ["(7,7)", "(7,8)", "(8,6)", "(8,7)", "(8,8)"]
}) => {
  const [selectedHexes, setSelectedHexes] = useState<Record<string, string>>({});
  const [pendingHex, setPendingHex] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<"blue" | "red">("blue");
  const [highlightedHexes, setHighlightedHexes] = useState<Record<string, string>>({});

  const getColor = (turn: "blue" | "red") => (turn === "blue" ? "#3498db" : "#e74c3c");

  const getValidDirections = (row: number, col: number): [number, number][] => {
    const isEvenRow = row % 2 === 0;
    return isEvenRow
      ? [[-1, 0], [-1, 1], [0, 1], [1, 0], [0, -1], [-1, -1]]
      : [[-1, 0], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
  };

  const highlightAvailableMoves = (turn: "blue" | "red") => {
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
              !(adjKey in selectedHexes)
            ) {
              adjacent[adjKey] = "#F4D03F"; // Highlight in yellow
            }
          });
        }
      }
    });
    setHighlightedHexes(adjacent); // Update highlighted hexes
  };

  useEffect(() => {
    const initialBlue: Record<string, string> = Object.create(null);
    initialBlueHexes.forEach(key => (initialBlue[key] = "#3498db"));
    const initialRed: Record<string, string> = Object.create(null);
    initialRedHexes.forEach(key => (initialRed[key] = "#e74c3c"));
    setSelectedHexes({ ...initialBlue, ...initialRed });
  }, []);

  useEffect(() => {
    highlightAvailableMoves(currentTurn); // Update highlighted hexes whenever the turn changes
  }, [selectedHexes, currentTurn]); // Re-run when selectedHexes or currentTurn changes

  const handleHexClick = (row: number, col: number) => {
    const key = `(${row},${col})`;
    if (!canAct || locked || !(key in highlightedHexes)) return; // Ensure hex is highlighted and clickable
    setPendingHex(key); // Set the hex to be bought
  };

  const handleBuy = () => {
    if (pendingHex) {
      setSelectedHexes(prev => ({
        ...prev,
        [pendingHex]: getColor(currentTurn), // Mark the hex with the current player's color
      }));
      setCurrentTurn(prev => (prev === "blue" ? "red" : "blue")); // Switch turn
      setLocked(true); // Lock the game until the next move
      setPendingHex(null); // Reset the pending hex
    }
  };

  const hexagons: React.ReactElement[] = [];
  for (let row = 1; row <= ROWS; row++) {
    for (let col = 1; col <= COLS; col++) {
      const x = (col - 1) * HEX_WIDTH * 0.75;
      const y = (row - 1) * HEX_HEIGHT + (col % 2 === 1 ? HEX_HEIGHT / 2 : 0);
      const key = `(${row},${col})`;
      const fillColor = selectedHexes[key] || highlightedHexes[key] || "none";

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
              cursor: key in highlightedHexes ? "pointer" : "default",
            }}
            onClick={() => handleHexClick(row, col)} // Handle the click event
          />
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
      {pendingHex && <BuyButton onBuy={handleBuy} />} {/* Render the BuyButton */}
    </div>
  );
};


export default HexGrid;
