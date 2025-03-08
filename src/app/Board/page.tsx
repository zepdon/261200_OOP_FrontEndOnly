"use client";
import HexGrid from "./HexGrid";
import styles from "./Hex.module.css";

export default function BoardPage() {
  return (
    <div className={styles.container}>
      <HexGrid canAct={true} />
    </div>
  );
}