"use client";
import { useState } from "react";
import Image from "next/image";
import HexGrid from "./HexGrid";
import BuyMinion from "./BuyMinion";
import styles from "./Hex.module.css";



export default function BordePage() {
  const [locked, setLocked] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [gold, setGold] = useState(10000);
  const [selectedMinion, setSelectedMinion] = useState<null | { id: number; name: string; src: string }>(null);

  const minions = [
    { id: 1, src: "/image/Minion/minion1.png", name: "Minion 1", price: 1000 },
    { id: 2, src: "/image/Minion/minion2.png", name: "Minion 2", price: 1500 },
    { id: 3, src: "/image/Minion/minion3.png", name: "Minion 3", price: 2000 },
    { id: 4, src: "/image/Minion/minion4.png", name: "Minion 4", price: 2500 },
    { id: 5, src: "/image/Minion/minion5.png", name: "Minion 5", price: 3000 },
  ];

  const handleBuyMinion = (minionId: number) => {
  const minion = minions.find(m => m.id === minionId);
  if (minion && gold >= minion.price) {
    setGold(prevGold => prevGold - minion.price);
    setSelectedMinion(minion); // Set the minion to be placed
    setIsPopupOpen(false); // Close the buy popup
  }
};


  const handlePlaceMinion = (hexKey: string) => {
    if (selectedMinion) {
      alert(`Spawned ${selectedMinion.name} at ${hexKey}`);
      setSelectedMinion(null); // รีเซ็ตหลังจากวาง Minion
    }
  };


  return (
    <div className={styles.container}>

      
      <div style={{ position: 'absolute', top: '5%', left: '3%', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Image
        src="/image/profile/profile.png"
        alt="Profile Image"
        width={100}
        height={100}
      />

      <div style={{position:"fixed", top:'15%', right:'10%'}}>
        <div className={styles.button} onClick={() => setIsPopupOpen(true)}>
          Buy Minion
        </div>
      </div>
      {isPopupOpen && (
        <BuyMinion onClose={() => setIsPopupOpen(false)} onBuy={handleBuyMinion} gold={gold} />
      )}

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
      /><h1 style={{ color: '#f4d03f' }}>{gold}</h1>
      </div>

      <div className={styles.buttonContainer}>
      <div className={styles.button}>
      BuyHex
      </div>
      </div>
      <HexGrid 
        canAct={true}
        locked={locked}
        setLocked={setLocked}
        selectedMinion={selectedMinion}
        onPlaceMinion={handlePlaceMinion}
      /> 
    </div>
  );
}
