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
  owner:"blue" | "red";
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
  const [selectedMinion, setSelectedMinion] = useState<Minion | null>(null); //ใช้เก็บข้อมูลมินเนี่ยน
  const [selectedHexes, setSelectedHexes] = useState<Record<string, string>>({}); //เก็บข้อมูล Hex
  const [minionPositions, setMinionPositions] = useState<Record<string, Minion>>({}); //เก็บมินเนี่ยนทั้งหมดบนกระดาน โดยใช้ ตำแหน่ง (row,col) เป็น key
  const [pendingHex, setPendingHex] = useState<string | null>(null); //ใช้เก็บ Hex ที่กำลังรอซื้อ
  const [currentTurn, setCurrentTurn] = useState<"blue" | "red">("blue"); //ใช้บอกว่าเป็นเทิร์นของใคร
  const [turnCount, setTurnCount] = useState(1); //บอกจำนวนรอบที่ผ่านไป
  const [highlightedHexes, setHighlightedHexes] = useState<Record<string, string>>({}); //ใช้เก็บ Hex ที่สามารถซื้อได้
  const [hasPlacedMinion, setHasPlacedMinion] = useState(false); // ตรวจสอบว่าวางมินเนี่ยนแล้วหรือยัง
  const [isBuyingHex, setIsBuyingHex] = useState(false); // ใช้บอกว่า ผู้เล่นกำลังอยู่ในโหมดซื้อ Hex หรือไม่
  const [hasBoughtHex, setHasBoughtHex] = useState(false); // ใช้บอกว่า ผู้เล่นซื้อ Hex ในรอบนี้แล้วหรือยัง
  const [selectedMinionInfo, setSelectedMinionInfo] = useState<Minion | null>(null); //ใช้เก็บ Status ของมินเนี่ยน
  const [nextMinionId, setNextMinionId] = useState(1); // เริ่มต้นที่ 1
  const [maxspawnblue, setmaxspawnblue] = useState(15);
  const [maxspawnred, setmaxspawnred] = useState(15);

  const minions: Minion[] = [
    {
      id: 1, name: "Minion 1", price: 1000, hp: 100, def: 5, owner: "blue", src: "/image/Minion/minion1.png",
      row: -1, // ยังไม่ได้วางบนกระดาน
      col: -1,
    },
    {
      id: 2,name: "Minion 2", price: 1000, hp: 100,def: 6, owner: "blue", src: "/image/Minion/minion2.png",
      row: -1,
      col: -1,
    },
    {
      id: 3,name: "Minion 3", price: 1000,hp: 100, def: 4, owner: "blue", src: "/image/Minion/minion3.png",
      row: -1,
      col: -1,
    },{
      id: 4,name: "Minion 4", price: 1000, hp: 100, def: 5, owner: "blue", src: "/image/Minion/minion4.png",
      row: -1,
      col: -1,
    },
    {
      id: 5,name: "Minion 5", price: 1000, hp: 100, def: 7, owner: "blue", src: "/image/Minion/minion5.png",
      row: -1,
      col: -1,
    },
  ];
  const [minionupdate, setMinionupdate] = useState<minionupdate[]>([
    { row: 7, col: 8, typeNumber: 2, hp: 100, defenceFactor: 2, src: "/image/Minion/minion1.png",owner: "blue" },
    { row: 7, col: 7, typeNumber: 2, hp: 100, defenceFactor: 2, src: "/image/Minion/minion2.png",owner: "red" },
    { row: 1, col: 2, typeNumber: 2, hp: 100, defenceFactor: 2, src: "/image/Minion/minion3.png",owner: "blue" }
  ]);

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
        owner: minion.owner, 
        src: minion.src,
        row: minion.row,
        col: minion.col,
      };
    });
  
    // อัปเดต minionPositions
    setMinionPositions(updatedPositions);
  };

  //ใช้สำหรับวางมินเนียนเมื่อกดเลือกมินเนียนจาก shop แล้วจะหักเงินเมื่อวางลงช่อง
  const handlePlaceMinion = (hexKey: string) => {
    if (selectedMinion) {
      const currentGold = currentTurn === "blue" ? goldBlue : goldRed;
      if (currentGold >= selectedMinion.price) {
        // หักเงิน
        if (currentTurn === "blue") {
          setGoldBlue((prev) => prev - selectedMinion.price);
          setmaxspawnblue((prev) => prev - 1);
        } else {
          setGoldRed((prev) => prev - selectedMinion.price);
          setmaxspawnred((prev) => prev - 1);
        }
  
        // แยก row และ col จาก hexKey
        const match = hexKey.match(/\((\d+),(\d+)\)/);
        if (!match) return;
  
        const [_, rowStr, colStr] = match;
        const row = parseInt(rowStr, 10);
        const col = parseInt(colStr, 10);
  
        // สร้างมินเนี่ยนใหม่พร้อม owner และตำแหน่ง
        const newMinion = {
          ...selectedMinion,
          id: nextMinionId, // ใช้ nextMinionId เป็น id ของมินเนี่ยนใหม่
          owner: currentTurn,
          row, // กำหนด row ใหม่
          col, // กำหนด col ใหม่
        };
  
        // เพิ่มมินเนี่ยนลงในตำแหน่งที่เลือก
        setMinionPositions((prev) => ({
          ...prev,
          [hexKey]: newMinion,
        }));
  
        // เพิ่มค่า nextMinionId ขึ้น 1
        setNextMinionId((prev) => prev + 1);
  
        alert(`Spawned ${selectedMinion.name} at ${hexKey}`);
        setSelectedMinion(null); // รีเซ็ตมินเนี่ยนที่เลือก
        setHasPlacedMinion(true); // ตั้งค่าสถานะการวางมินเนี่ยน
      } else {
        alert("คุณมีเงินไม่เพียงพอ!");
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
      handlePlaceMinion(key); // เรียกใช้ handlePlaceMinion เพื่อวางมินเนี่ยน
      return;
    }
  
     if (minionPositions[key]) {
       setSelectedMinionInfo(minionPositions[key]);
     }
  };

  // const updateMinionPositions = (newPositions: Record<string, Minion>) => {
  //   const updatedPositions: Record<string, Minion> = {};
  
  //   Object.entries(newPositions).forEach(([key, minion]) => {
  //     const match = key.match(/\((\d+),(\d+)\)/); // แยกแถว (row) และคอลัมน์ (col) จาก key
  //     if (!match) return;
  
  //     const [_, rowStr, colStr] = match;
  //     const row = parseInt(rowStr, 10); // แปลง row เป็นเลข
  //     const col = parseInt(colStr, 10); // แปลง col เป็นเลข
  
  //     // ตรวจสอบว่าตำแหน่งใหม่อยู่ในขอบเขตของกระดาน
  //     if (row > 0 && row <= ROWS && col > 0 && col <= COLS) {
  //       updatedPositions[key] = {
  //         ...minion,
  //         row, // อัปเดต row
  //         col, // อัปเดต col
  //       };
  //     }
  //   });
  
  //   // อัปเดตตำแหน่งของมินเนี่ยนทั้งหมด
  //   setMinionPositions(updatedPositions);
  // };


  const handleEndTurn = () => {   // ฟังก์ชันสิ้นสุดเทิร์น
    setCurrentTurn(prev => (prev === "blue" ? "red" : "blue")); // สลับเทิร์นระหว่าง Blue และ Red
    setTurnCount(prev => prev + 1); // เพิ่มจำนวนเทิร์นที่ผ่านไป
    setLocked(false);
    setPendingHex(null); // รีเซ็ต Hex ที่กำลังรอการซื้อ
    setHasPlacedMinion(false); // รีเซ็ตสถานะการวางมินเนี่ยน
    setHasBoughtHex(false); // รีเซ็ตสถานะการซื้อ Hex
    setHighlightedHexes({}); // รีเซ็ต Hex ที่สามารถซื้อได้
    updateMinionPositionsFromMinionUpdate();
    //updateMinionPositions; // เดินมินเนี่ยนตอนจบเทิร์น
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

  const [mode] = useState<number>(1);

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
        <div>
          <h1 style={{ margin: 0 }}>Player1</h1>
          <br />
          <h4 style={{ margin: 0 }}>Spawn Remeaning: {maxspawnblue}</h4>
        </div>
      </div>

      <button
          style={{ 
            position: "fixed", 
            top: '15%', 
            right: '10%',
            borderRadius: "8px",
            fontSize: "1.5rem",
            cursor: 
            mode === 2 && currentTurn === "red" || 
            mode === 3 ||
            currentTurn === "blue" && maxspawnblue === 0 ||
            currentTurn === "red" && maxspawnred === 0 ? "not-allowed" : "pointer"
          }}
          onClick={() => setIsPopupOpen(true)}
          disabled={
            mode === 2 && currentTurn === "red" || // ถ้า mode เท่ากับ 2 และเป็นเทิร์นฝั่งสีแดง
            mode === 3 || // ถ้า mode เท่ากับ 3 
            currentTurn === "blue" && maxspawnblue === 0 ||
            currentTurn === "red" && maxspawnred === 0
          }
        >
          Buy Minion
        </button>
        {isPopupOpen && (
        <BuyMinion
          onClose={() => setIsPopupOpen(false)}
          onBuy={handleBuyMinion}
          gold={currentTurn === "blue" ? goldBlue : goldRed} // ส่งเงินของผู้เล่นที่กำลังเล่นเทิร์น
        />
        )}

      {/* UI Player 2 */}
      <div style={{ position: 'fixed', bottom: '5%', right: '3%', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Player2</h1>
          <br />
          <h4 style={{ margin: 0 }}>Spawn Remeaning: {maxspawnred}</h4>
        </div>
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


      {/* ปุ่ม Done */}
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
          <p>ID: {selectedMinionInfo.id}</p>
          <p>Owner: {selectedMinionInfo.owner}</p>
          <p>HP: {selectedMinionInfo.hp}</p>
          <p>DEF: {selectedMinionInfo.def}</p>
          <p>Position: ({selectedMinionInfo.row}, {selectedMinionInfo.col})</p>
        </div>
      )}
    </div>
  );
};

export default HexGrid;