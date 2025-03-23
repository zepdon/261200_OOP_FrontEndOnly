"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./BuyMinion.module.css";
import { webSocketService } from "../../services/websocket";

const minions = [
  { id: 1, src: "/image/Minion/minion1.png", name: "Minion 1", price: 1000 },
  { id: 2, src: "/image/Minion/minion2.png", name: "Minion 2", price: 1000 },
  { id: 3, src: "/image/Minion/minion3.png", name: "Minion 3", price: 1000 },
  { id: 4, src: "/image/Minion/minion4.png", name: "Minion 4", price: 1000 },
  { id: 5, src: "/image/Minion/minion5.png", name: "Minion 5", price: 1000 },
];

interface BuyMinionProps {
  onClose: () => void;
  onBuy: (minionId: number) => void;
  gold: number;
  showCount: number;
  minions: { id: number; src: string; name: string; price: number }[]; // Add minions as a prop
}

const BuyMinion: React.FC<BuyMinionProps> = ({ onClose, onBuy, gold, showCount, minions }) => {
  // Use showCount to determine the number of minions to display
  const displayedMinions = minions.slice(0, showCount);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✖
        </button>
        <h2 className={styles.title}>Buy Minion</h2>

        <div className={styles.minionList}>
          {displayedMinions.map((minion) => (
            <div key={minion.id} className={styles.minionCard}>
              <Image
                src={minion.src}
                alt={minion.name}
                width={80}
                height={80}
                unoptimized={true}
              />
              <p className={styles.minionName}>{minion.name}</p>
              <p
                className={styles.price}
                style={{ color: gold >= minion.price ? "#FFD700" : "#FF4444" }}
              >
                {minion.price} Gold
              </p>
              <button
                className={styles.buyBtn}
                onClick={() => onBuy(minion.id)}
                disabled={gold < minion.price}
              >
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyMinion;