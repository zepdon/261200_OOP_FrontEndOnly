import React from "react";
import styles from "./minionselect.module.css";

export default function MinionSelection() {
  return (
    <div className={styles.container}>
      <h1 className={styles.question}>How many minion type</h1>
      <div className={styles.buttonGroup}>
        {["I", "II", "III", "IV", "V"].map((num) => (
          <button key={num} className={styles.button}>
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
