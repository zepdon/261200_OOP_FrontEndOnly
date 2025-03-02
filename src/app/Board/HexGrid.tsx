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
  gold: number; // เพิ่ม gold ใน props
  setGold: React.Dispatch<React.SetStateAction<number>>; // เพิ่ม setGold ใน props
}

const HexGrid: React.FC<HexGridProps> = ({
  canAct,
  locked,
  setLocked,
  initialBlueHexes = ["(1,1)", "(1,2)", "(2,1)", "(2,2)", "(1,3)"],
  initialRedHexes = ["(7,7)", "(7,8)", "(8,6)", "(8,7)", "(8,8)"],
  selectedMinion,
  gold, // รับ gold จาก props
  setGold, // รับ setGold จาก props
  onPlaceMinion
}) => {
  const [selectedHexes, setSelectedHexes] = useState<Record<string, string>>({});
  const [minionPositions, setMinionPositions] = useState<Record<string, { id: number; src: string; owner: "blue" | "red"; atk: number; def: number ;hp: number}>>({});
  const [pendingHex, setPendingHex] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<"blue" | "red">("blue");
  const [turnCount, setTurnCount] = useState(1);
  const [highlightedHexes, setHighlightedHexes] = useState<Record<string, string>>({});
  const [hasPlacedMinion, setHasPlacedMinion] = useState(false);
  const [isBuyingHex, setIsBuyingHex] = useState(false);
  const [hasBoughtHex, setHasBoughtHex] = useState(false);
  const [selectedMinionInfo, setSelectedMinionInfo] = useState<{ id: number; owner: "blue" | "red"; atk: number; def: number ; hp: number} | null>(null);

  const getColor = (turn: "blue" | "red") => (turn === "blue" ? "#3498db" : "#e74c3c");

  const getValidDirections = (row: number, col: number): [number, number][] => {
    const isEvenRow = row % 2 === 0;
    return isEvenRow
      ? [[-1, 0], [-1, 1], [0, 1], [1, 0], [0, -1], [-1, -1]] // แถวคู่
      : [[-1, 0], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]]; // แถวคี่
  };

  const highlightAvailableMoves = (turn: "blue" | "red") => {
    if (!isBuyingHex) {
      setHighlightedHexes({});
      return;
    }
  
    const adjacent: Record<string, string> = {};
  
    // ฟังก์ชันตรวจสอบว่าเซลล์ที่อยู่ติดกันเป็นของฝั่งตัวเองหรือไม่
    const isAdjacentToOwnHex = (row: number, col: number): boolean => {
      const directions = getValidDirections(row, col);
      for (const [dr, dc] of directions) {
        const adjRow = row + dr;
        const adjCol = col + dc;
        if (adjRow > 0 && adjRow <= ROWS && adjCol > 0 && adjCol <= COLS) {
          const adjKey = `(${adjRow},${adjCol})`;
          if (selectedHexes[adjKey] === getColor(turn)) {
            return true; // เซลล์นี้อยู่ติดกับเซลล์ของฝั่งตัวเอง
          }
        }
      }
      return false; // ไม่มีเซลล์ของฝั่งตัวเองติดกัน
    };
  
    // วนลูปผ่านทุกเซลล์ในเกม
    for (let row = 1; row <= ROWS; row++) {
      for (let col = 1; col <= COLS; col++) {
        const key = `(${row},${col})`;
  
        // ตรวจสอบว่าเซลล์นี้ยังไม่ถูกเลือก และอยู่ติดกับเซลล์ของฝั่งตัวเอง
        if (
          !(key in selectedHexes) && // เซลล์นี้ยังไม่ถูกเลือก
          isAdjacentToOwnHex(row, col) // เซลล์นี้อยู่ติดกับเซลล์ของฝั่งตัวเอง
        ) {
          adjacent[key] = "#F4D03F"; // สีเหลือง
        }
      }
    }
  
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
  }, [selectedHexes, currentTurn, isBuyingHex]);

  const handleHexClick = (row: number, col: number) => {
    if (!canAct || locked) return;
    const key = `(${row},${col})`;
  
    if (isBuyingHex) {
      if (key in highlightedHexes) {
        if (gold >= 1000) { // ตรวจสอบว่ามีเงินเพียงพอหรือไม่
          setSelectedHexes(prev => ({
            ...prev,
            [key]: getColor(currentTurn),
          }));
          setIsBuyingHex(false);
          setHasBoughtHex(true);
          setHighlightedHexes({});
          setGold(prevGold => prevGold - 500); // หักเงิน
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
      onPlaceMinion(key);
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
    highlightAvailableMoves(currentTurn);
  };

  // ฟังก์ชันสำหรับปิดแถบสถานะ
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
              onClick={() => setSelectedMinionInfo(minion)} // คลิกที่มินเนียน
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

      {/* ปุ่ม Buy Hex และ Done */}
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
            highlightAvailableMoves(currentTurn);
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

      {/* แสดง Turn Count และ Turn */}
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

      {/* แสดงสถานะของมินเนียนที่ถูกคลิก */}
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
          <p style={{fontWeight: "bold"}}>Minion status</p>
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