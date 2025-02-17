import HexGrid from "./HexGrid"; // นำเข้า HexGrid (ตรวจสอบ path)
import styles from "./Hex.module.css";
export default function BordePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Turn 1</h1>
      <HexGrid />
    </div>
  );
}
