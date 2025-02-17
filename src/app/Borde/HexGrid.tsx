"use client"; 
import React, { useState } from "react";
import styles from "./Hex.module.css";

const gridSize = 8; // ขนาด 8x8

export default function HexGrid() {
  const [hexColors, setHexColors] = useState(
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill("white"))
  );

  const handleHexClick = (row: number, col: number) => {
    setHexColors((prevColors) => {
      const newColors = prevColors.map((r) => [...r]);
      newColors[row][col] =
        newColors[row][col] === "white" ? "blue" : newColors[row][col] === "blue" ? "red" : "white";
      return newColors;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {hexColors[0].map((_, colIndex) => (
          <div key={colIndex} className={styles.column}>
            {hexColors.map((_, rowIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${styles.hex} ${styles[hexColors[rowIndex][colIndex]]}`}
                onClick={() => handleHexClick(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
