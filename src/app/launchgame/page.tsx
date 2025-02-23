// src/app/launchgame/page.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useGameConfig } from "../../context/GameConfigContext";
import styles from "./LaunchGame.module.css";

export default function LaunchGamePage() {
  const router = useRouter();
  const { mode, minionTypes } = useGameConfig();

  const handleLaunch = async () => {
    // Prepare payload with mode and minion type details.
    const payload = { mode, minionTypes };
    try {
      const response = await fetch("http://localhost:8080/api/launchGame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.text();
      console.log("Game launch response:", data);
      // Navigate to the game board or a waiting page.
      router.push("/Borde");
    } catch (error) {
      console.error("Error launching game:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Review Game Settings</h1>
      <p>Mode: {mode}</p>
      <p>Minion Types:</p>
      <ul>
        {minionTypes.map((mt, idx) => (
          <li key={idx}>
            {mt.name} | DEF: {mt.defenseFactor}
          </li>
        ))}
      </ul>
      <button onClick={handleLaunch}>Launch Game</button>
    </div>
  );
}
