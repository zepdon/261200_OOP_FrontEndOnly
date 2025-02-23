"use client";
import React, { useState, useEffect, useMemo } from "react";
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

  // Initialize board with starting hexes.
  useEffect(() => {
    const initialBlue: Record<string, string> = {};
    initialBlueHexes.forEach(key => { initialBlue[key] = "#3498db"; });
    const initialRed: Record<string, string> = {};
    initialRedHexes.forEach(key => { initialRed[key] = "#e74c3c"; });
    setSelectedHexes({ ...initialBlue, ...initialRed });
  }, [initialBlueHexes, initialRedHexes]);

  // Compute highlighted hexes using useMemo so it recalculates only when selectedHexes or currentTurn change.
  const computedHighlightedHexes = useMemo(() => {
    const adjacent: Record<string, string> = {};
    Object.keys(selectedHexes).forEach(hex => {
      if (selectedHexes[hex] === getColor(currentTurn)) {
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
              adjacent[adjKey] = "#F4D03F"; // Highlight available move in yellow
            }
          });
        }
      }
    });
    return adjacent;
  }, [selectedHexes, currentTurn]);

  // Update state only when computedHighlightedHexes changes.
  useEffect(() => {
    setHighlightedHexes(computedHighlightedHexes);
  }, [computedHighlightedHexes]);

  const handleHexClick = (row: number, col: number) => {
    const key = `(${row},${col})`;
    if (!canAct || locked || !(key in highlightedHexes)) return;
    setPendingHex(key);
  };

  const handleBuy = async () => {
    if (pendingHex) {
      setSelectedHexes(prev => ({
        ...prev,
        [pendingHex]: getColor(currentTurn),
      }));
      setCurrentTurn(prev => (prev === "blue" ? "red" : "blue"));
      setLocked(true);
      const hexKey = pendingHex;
      setPendingHex(null);
      const matches = hexKey.match(/\((\d+),(\d+)\)/);
      if (matches) {
        const row = parseInt(matches[1], 10);
        const col = parseInt(matches[2], 10);
        const player = currentTurn === "blue" ? "Player1" : "Player2";
        try {
          const response = await fetch("http://localhost:8080/api/buyHex", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ row, col, player }),
          });
          const data = await response.text();
          console.log("BuyHex response:", data);
        } catch (error) {
          console.error("Error sending buy hex request:", error);
        }
      }
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
            style={{ pointerEvents: "all", cursor: key in highlightedHexes ? "pointer" : "default" }}
            onClick={() => handleHexClick(row, col)}
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
      {pendingHex && <BuyButton onBuy={handleBuy} />}
    </div>
  );
};

export default HexGrid;
