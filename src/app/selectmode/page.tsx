'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './selectmode.module.css';
import React from 'react';
import { useGameConfig } from '../../context/GameConfigContext';
import { GameMode } from '../../context/GameConfigContext';

export default function Page() {
  const router = useRouter();
  const { setMode } = useGameConfig();

  const handleModeSelect = (mode: GameMode) => {
    setMode(mode);
    router.push("/selectminion"); // Navigate to minion selection page
  };

  return (
    <div className={styles.imageContainer}>
      {/* Background image */}
      <div className={styles.backgroundImage}>
        <Image
          src="/image/background/ModePage.png"
          alt="Background for mode selection"
          width={1440}
          height={1024}
          layout="responsive"
        />
      </div>
      
      {/* Buttons for selecting mode */}
      <div className={styles.buttonWrapper}>
        <div className={styles.buttonWithText}>
          <button className={styles.button} onClick={() => handleModeSelect("DUEL")}>
            <Image
              src="/image/button/1VS1.png"
              alt="Select 1 vs 1 mode"
              width={314}
              height={314}
            />
          </button>
          <Image
            src="/image/word/1VS1 HEX MAP.png"
            alt="1VS1 label"
            width={140}
            height={84}
          />
        </div>
        <div className={styles.buttonWithText}>
          <button className={styles.button} onClick={() => handleModeSelect("SOLITAIRE")}>
            <Image
              src="/image/button/1VSAI.png"
              alt="Select 1 vs AI mode"
              width={314}
              height={314}
            />
          </button>
          <Image
            src="/image/word/1VSAI HEX MAP.png"
            alt="1VS AI label"
            width={140}
            height={84}
          />
        </div>
        <div className={styles.buttonWithText}>
          <button className={styles.button} onClick={() => handleModeSelect("AUTO")}>
            <Image
              src="/image/button/AIVSAi.png"
              alt="Select AI vs AI mode"
              width={314}
              height={314}
            />
          </button>
          <Image
            src="/image/word/AI VS AI HEX MAP.png"
            alt="AI vs AI label"
            width={160}
            height={84}
          />
        </div>
      </div>
    </div>
  );
}
