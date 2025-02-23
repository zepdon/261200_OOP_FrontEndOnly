// src/app/minionselect/page.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./minionselect.module.css";
import { useGameConfig } from "../../context/GameConfigContext";

export default function MinionSelectionPage() {
  const router = useRouter();
  const { setMinionCount } = useGameConfig();

  const handleSelection = (count: number) => {
    setMinionCount(count);
    router.push("/strategy1"); // Navigate to first strategy page
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.question}>How many minion types?</h1>
      <div className={styles.buttonGroup}>
        {["I", "II", "III", "IV", "V"].map((num, index) => (
          <button key={num} className={styles.button} onClick={() => handleSelection(index + 1)}>
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
