"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import BuyMinion from "./BuyMinion";
import styles from "./Hex.module.css";

const HEX_RADIUS = 40; // รัศมีของ Hexagon
const COLS = 8; 
const ROWS = 8; 
const HEX_WIDTH = 2 * HEX_RADIUS; // ความกว้างของ Hex
const HEX_HEIGHT = Math.sqrt(3) * HEX_RADIUS; // ความสูงของ Hex

interface HexGridProps { // Interface ของ HexGrid
  canAct: boolean;
  initialBlueHexes?: string[]; // Hex เริ่มต้นของทีม Blue
  initialRedHexes?: string[]; // Hex เริ่มต้นของทีม Red
}
const HexGrid: React.FC<HexGridProps> = ({
  canAct,
  initialBlueHexes = ["(1,1)", "(1,2)", "(2,1)", "(2,2)", "(1,3)"], // Hex เริ่มต้นของทีม Blue
  initialRedHexes = ["(7,7)", "(7,8)", "(8,6)", "(8,7)", "(8,8)"], // Hex เริ่มต้นของทีม Red
}) => {
  const [locked, setLocked] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false); //ควบคุมว่า Popup ของ UI
  const [goldBlue, setGoldBlue] = useState(10000); // เงินของ Player 1 (Blue)
  const [goldRed, setGoldRed] = useState(10000); // เงินของ Player 2 (Red)
  const [selectedMinion, setSelectedMinion] = useState<null | { id: number; name: string; src: string }>(null); //ใช้เก็บข้อมูลมินเนี่ยน
  const [selectedHexes, setSelectedHexes] = useState<Record<string, string>>({}); //เก็บข้อมูล Hex
  const [minionPositions, setMinionPositions] = useState<Record<string, { id: number; src: string; owner: "blue" | "red"; atk: number; def: number; hp: number }>>({}); //เก็บมินเนี่ยนทั้งหมดบนกระดาน โดยใช้ ตำแหน่ง (row,col) เป็น key
  const [pendingHex, setPendingHex] = useState<string | null>(null); //ใช้เก็บ Hex ที่กำลังรอซื้อ
  const [currentTurn, setCurrentTurn] = useState<"blue" | "red">("blue"); //ใช้บอกว่าเป็นเทิร์นของใคร
  const [turnCount, setTurnCount] = useState(1); //บอกจำนวนรอบที่ผ่านไป
  const [highlightedHexes, setHighlightedHexes] = useState<Record<string, string>>({}); //ใช้เก็บ Hex ที่สามารถซื้อได้
  const [hasPlacedMinion, setHasPlacedMinion] = useState(false); // ตรวจสอบว่าวางมินเนี่ยนแล้วหรือยัง
  const [isBuyingHex, setIsBuyingHex] = useState(false); // ใช้บอกว่า ผู้เล่นกำลังอยู่ในโหมดซื้อ Hex หรือไม่
  const [hasBoughtHex, setHasBoughtHex] = useState(false); // ใช้บอกว่า ผู้เล่นซื้อ Hex ในรอบนี้แล้วหรือยัง
  const [selectedMinionInfo, setSelectedMinionInfo] = useState<{ id: number; owner: "blue" | "red"; atk: number; def: number; hp: number } | null>(null); //ใช้เก็บ Status ของมินเนี่ยน

  const minions = [ // ข้อมูลมินเนี่ยน
    { id: 1, src: "/image/Minion/minion1.png", name: "Minion 1", price: 1000 },
    { id: 2, src: "/image/Minion/minion2.png", name: "Minion 2", price: 1000 },
    { id: 3, src: "/image/Minion/minion3.png", name: "Minion 3", price: 1000 },
    { id: 4, src: "/image/Minion/minion4.png", name: "Minion 4", price: 1000 },
    { id: 5, src: "/image/Minion/minion5.png", name: "Minion 5", price: 1000 },
  ];

  //ใช้กดเลือกซื้อมินเนียนในหน้า Shop แต่ยังไม่หักเงิน
  const handleBuyMinion = (minionId: number) => {
    const minion = minions.find(m => m.id === minionId);
    if (minion) {
      if (currentTurn === "blue" && goldBlue >= minion.price) {
        setSelectedMinion(minion); // เลือกมินเนี่ยน
        setIsPopupOpen(false); // ปิด Popup
      } else if (currentTurn === "red" && goldRed >= minion.price) {
        setSelectedMinion(minion);
        setIsPopupOpen(false);
      } else {
        alert("คุณมีเงินไม่เพียงพอ!");
      }
    }
  };

  //ใช้สำหรับวางมินเนียนเมื่อกดเลือกมินเนียนจาก shop แล้วจะหักเงินเมื่อวางลงช่อง
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
        setSelectedMinion(null); // รีเซ็ตมินเนี่ยนที่เลือก
      }
    }
  };

    //คำนวณช่องสีเหลืองที่สามารถซื้อได้เมื่อจะซื้อช่อง
  const getColor = (turn: "blue" | "red") => (turn === "blue" ? "#3498db" : "#e74c3c");
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
  

  useEffect(() => { // ตั้งค่า Hex เริ่มต้นของทีม Blue และ Red
    const initialBlue: Record<string, string> = Object.create(null);
    initialBlueHexes.forEach(key => (initialBlue[key] = "#3498db"));
    const initialRed: Record<string, string> = Object.create(null);
    initialRedHexes.forEach(key => (initialRed[key] = "#e74c3c"));
    setSelectedHexes({ ...initialBlue, ...initialRed });
  }, []);

  useEffect(() => { // คำนวณ Hex ที่สามารถซื้อได้เมื่ออยู่ในโหมดซื้อ Hex
    if (isBuyingHex) {
      const adjacentHexes = calculateAdjacentHexes(selectedHexes, currentTurn);
      setHighlightedHexes(adjacentHexes);
    } else {
      setHighlightedHexes({});
    }
  }, [selectedHexes, currentTurn, isBuyingHex]);

  const handleHexClick = (row: number, col: number) => { // ฟังก์ชันเมื่อคลิกที่ Hex
    if (!canAct || locked) return;
    const key = `(${row},${col})`;
  
    if (isBuyingHex) { // ถ้าอยู่ในโหมดซื้อ Hex
      if (key in highlightedHexes) { // ตรวจสอบเงินของผู้เล่นที่กำลังเล่นเทิร์นว่าพอจะซื้อช่องหรือเปล่า
        const currentGold = currentTurn === "blue" ? goldBlue : goldRed;
        if (currentGold >= 500) {
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

    // หากคลิกที่ Hex ของตัวเองและมีมินเนี่ยนที่เลือกอยู่
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
  
    if (minionPositions[key]) { // หากคลิกที่มินเนี่ยนที่มีอยู่แล้ว
      setSelectedMinionInfo(minionPositions[key]);
    }
  };

  const moveMinions = () => {
    const newMinionPositions = { ...minionPositions }; //ลอกข้อมูลจาก minionPositions
    const minionKeys = Object.keys(newMinionPositions).filter(key => newMinionPositions[key].owner === currentTurn); //เช็ค minnion ของคนที่กำลังเล่นอยู่
  
    minionKeys.forEach(key => { //loop เดินมินเนียนแต่ละตัว
      const minion = newMinionPositions[key];
      const match = key.match(/\((\d+),(\d+)\)/); // แยกแถว (row) และคอลัมน์ (col) จาก key
      if (!match) return;  // ถ้าไม่ตรงกับ key ให้ออกจากลูป
  
      const [_, rowStr, colStr] = match;
      const row = parseInt(rowStr, 10); //แปลง row เป็นเลข
      const col = parseInt(colStr, 10); //แปลง col เป็นเลข
  
      // กำหนดทิศทางที่มินเนี่ยนสามารถเคลื่อนที่ได้
      const directions = col % 2 === 0
      //colum คู่
        ? [[-1, 0], //บน
          [-1, 1], //ขวาบน
          [0, 1], //ขวาล่าง
          [1, 0], //ล่าง
          [0, -1], //ซ้ายบน
          [-1, -1]] //ซ้ายล่าง
      //colum คี่
        : [[-1, 0], //บน
          [0, 1], //ขวาขวา
          [1, 1], //ขวาล่าง
          [1, 0], //ล่าง
          [1, -1], //ซ้ายบน
          [0, -1]]; //ซ้ายล่าง
  
      // สุ่มเลือกทิศทางจากทิศทางที่เป็นไปได้ (ถ้าจะแก้ทิศทางเดินให้แก้ตรงนี้กับข้างบน) ไม่ก็ทำเช็คเคสดู
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)]; // เลือกทิศแบบสุ่ม
       // คำนวณตำแหน่งใหม่จากทิศทางที่สุ่มได้
      const newRow = row + dr;
      const newCol = col + dc;
      const newKey = `(${newRow},${newCol})`; //สร้าง key ใหม่
      
      //เช็คว่าตำแหน่งใหม่จะเดินได้
      if (
        newRow > 0 && newRow <= ROWS &&
        newCol > 0 && newCol <= COLS &&
        !newMinionPositions[newKey] // ตรวจสอบว่าไม่มีมินเนี่ยนอื่นอยู่
      ) {
        delete newMinionPositions[key]; // ลบมินเนี่ยนออกจากตำแหน่งเดิม
        newMinionPositions[newKey] = minion; // ย้ายมินเนี่ยนไปตำแหน่งใหม่
      }
    });
    // อัปเดตตำแหน่งมินเนี่ยนทั้งหมด
    setMinionPositions(newMinionPositions);
  };

  const handleEndTurn = () => {   // ฟังก์ชันสิ้นสุดเทิร์น
    setCurrentTurn(prev => (prev === "blue" ? "red" : "blue")); // สลับเทิร์นระหว่าง Blue และ Red
    setTurnCount(prev => prev + 1); // เพิ่มจำนวนเทิร์นที่ผ่านไป
    setLocked(false);
    setPendingHex(null); // รีเซ็ต Hex ที่กำลังรอการซื้อ
    setHasPlacedMinion(false); // รีเซ็ตสถานะการวางมินเนี่ยน
    setHasBoughtHex(false); // รีเซ็ตสถานะการซื้อ Hex
    setHighlightedHexes({}); // รีเซ็ต Hex ที่สามารถซื้อได้
    moveMinions(); // เดินมินเนี่ยนตอนจบเทิร์น
  };

  const handleCloseStatus = () => {   // ฟังก์ชันปิดหน้าต่างสถานะมินเนี่ยน
    setSelectedMinionInfo(null);
  };

  // สร้าง Hex Board 
  const hexagons: React.ReactElement[] = [];
  for (let row = 1; row <= ROWS; row++) {
    for (let col = 1; col <= COLS; col++) {
      const x = (col - 1) * HEX_WIDTH * 0.75;  //คำนวณตำแหน่ง colum 
      const y = (row - 1) * HEX_HEIGHT + (col % 2 === 1 ? HEX_HEIGHT / 2 : 0); //คำนวณตำแหน่ง row 
      const key = `(${row},${col})`;
      const fillColor = selectedHexes[key] || highlightedHexes[key] || "none";
      const minion = minionPositions[key];

      hexagons.push( // transform เอา Hex ไปอยู่ตำแหน่งที่คำนวณไว้
        <g key={key} transform={`translate(${x},${y})`}> 
          <polygon //กำหนดพิกัดของหกเหลี่ยม
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
            onClick={() => handleHexClick(row, col)} //ใช้สำหรับการเลือกซื้อ Hex
          />
          {minion && (
            <image
              href={minion.src}
              x={HEX_RADIUS * 0.1} //กำหนดตำแหน่งแกน X ของภาพ
              y={HEX_HEIGHT * -0.2} //กำหนดตำแหน่งแกน Y ของภาพ
              width={HEX_RADIUS * 1.5}
              height={HEX_HEIGHT * 1.5}
              onClick={() => setSelectedMinionInfo(minion)} // เมื่อกดคลิกตัวมินเนียนในสนามจะเปิด Status ขึ้นมา
            />
          )}
        </g>
      );
    }
  }

  return (
    <div style={{ position: "relative" }}>

      {/* UI Player 1 */}
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

      {/* UI Player 2 */}
      <div style={{ position: 'fixed', bottom: '5%', right: '3%', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1>Player2</h1>
        <Image
          src="/image/profile/profile.png"
          alt="Profile Image"
          width={100}
          height={100}
        />
      </div>

      {/* UI ส่วนของเงิน */}
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

      {/* SVG สำหรับแสดง Hex Board */}
      <svg 
        width={(COLS * HEX_WIDTH * 0.75) + HEX_RADIUS}
        height={(ROWS * HEX_HEIGHT) + (HEX_HEIGHT / 2)}
        viewBox={`0 0 ${(COLS * HEX_WIDTH * 0.75) + HEX_RADIUS} ${(ROWS * HEX_HEIGHT) + (HEX_HEIGHT / 2)}`}
        style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        {hexagons}
      </svg>

      {/* ปุ่ม Buy Hex */}
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

      {/* ปุ่ม Done */}
      <button
  style={{
    position: "fixed",
    top: "35%",
    left: "6%",
    fontSize: "1.5rem",
    fontWeight: "bold",
    backgroundColor: turnCount >= 3 || hasPlacedMinion ? "white" : "gray", 
    color: "black",
    border: "none",
    borderRadius: "8px",
    cursor: turnCount >= 3 || hasPlacedMinion ? "pointer" : "not-allowed", 
  }}
  onClick={handleEndTurn}
  disabled={turnCount < 3 ? !hasPlacedMinion : false} 
>
  Done
</button>


      {/* แสดงจำนวนเทิร์น */}
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

      {/* แสดงเทิร์นปัจจุบัน */}
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

      {/* แสดงสถานะมินเนี่ยน */}
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