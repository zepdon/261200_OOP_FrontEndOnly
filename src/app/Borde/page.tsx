"use client";
import Image from "next/image";
import React , { useState } from "react";
import HexGrid from "./HexGrid"; // ตรวจสอบ path ให้ถูกต้อง
import styles from "./Hex.module.css";
import BuyHexCard from "@components/BuyHexCardProps";

export default function BordePage() {
  const [locked, setLocked] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State สำหรับแสดง/ซ่อน Popup


  return (
    <div className={styles.container}>
      
      <div style={{ position: 'absolute', top: '5%', left: '3%', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Image
        src="/image/profile/profile.png"
        alt="Profile Image"
        width={100}
        height={100}
      />
      <h1>Player1</h1>
      </div>
      <div style={{ position: 'absolute', bottom: '5%', right: '3%', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <h1>Player2</h1>
      <Image
        src="/image/profile/profile.png"
        alt="Profile Image"
        width={100}
        height={100}
      />
      </div>

      <div style={{ position: 'absolute', bottom: '5%', left: '3%', display: 'flex', alignItems: 'end', gap: '10px' }}>
      <Image
        src="/image/icon/money-bag 1.png"
        alt="money"
        width={100}
        height={100}
      /><h1 style={{ color: '#f4d03f' }}>10,000</h1>
      </div>

      <div className={styles.buttonContainer}>
      <div className={styles.button} onClick={() => setIsPopupOpen(true)}>
      BuyHex
      </div>
      </div>
      <HexGrid 
        canAct={true} 
        locked={locked} 
        setLocked={setLocked} 
      /> <div style={{position: 'fixed',top: '50%',left: '50%',transform: 'translate(-50%, -50%)', zIndex: 9999,}}>
      {isPopupOpen && <BuyHexCard onClose={() => setIsPopupOpen(false)} />}
      </div>
    </div>
  );
}
