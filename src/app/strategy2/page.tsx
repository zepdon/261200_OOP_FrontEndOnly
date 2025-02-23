// src/app/strategy/page.tsx (e.g., strategy1)
"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Strategy.module.css';
import { useGameConfig } from '../../context/GameConfigContext';

export default function StrategyPage() {
  const router = useRouter();
  const { minionTypes, addMinionType, minionCount } = useGameConfig();
  const [minionName, setMinionName] = useState("");
  const [defenseFactor, setDefenseFactor] = useState("");
  const [strategyScript, setStrategyScript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setErrorMessage("");
    const payload = {
      name: minionName,
      defenseFactor,
      strategy: strategyScript,
    };

    try {
      const response = await fetch("http://localhost:8080/api/saveMinionType", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText);
      } else {
        // If valid, save the minion type in context.
        addMinionType({
          name: minionName,
          defenseFactor: parseInt(defenseFactor, 10),
          strategy: strategyScript,
        });
        // If not all minion types have been entered, go to the next strategy page.
        if (minionTypes.length + 1 < (minionCount || 0)) {
          // You could navigate to /strategy2, /strategy3, etc.
          router.push(`/strategy${minionTypes.length + 2}`);
        } else {
          // All minion types have been defined, navigate to the final launch page.
          router.push("/launchgame");
        }
      }
    } catch (error) {
      console.error("Error submitting minion type:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageAndInputContainer}>
        <div className={styles.imageContainer}>
          <Image src="/image/word/Create name.png" alt="Create Name" width={275} height={34} />
        </div>
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Enter your minion name"
            value={minionName}
            onChange={(e) => setMinionName(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.strategyAndInputContainer}>
        <div className={styles.strategyContainer}>
          <Image src="/image/word/STRATEGY MINION.png" alt="Strategy Minion" width={724} height={56} />
        </div>
        <div className={styles.strategyInputContainer}>
          <textarea
            placeholder="Type your minion strategy here"
            value={strategyScript}
            onChange={(e) => setStrategyScript(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.parentContainer}>
        <div className={styles.minionContainer}>
          <Image src="/image/component/minion2.png" alt="Minion1" width={379} height={471} />
        </div>
      </div>

      <div className={styles.defImageAndInputContainer}>
        <div className={styles.defImageContainer}>
          <Image src="/image/word/DEF.png" alt="Defense" width={114} height={40} />
        </div>
        <div className={styles.defInputContainer}>
          <input
            type="text"
            placeholder="Enter your minion DEF"
            value={defenseFactor}
            onChange={(e) => setDefenseFactor(e.target.value)}
          />
        </div>
      </div>

      {errorMessage && (
        <div className={styles.errorMessage}>
          <p>{errorMessage}</p>
        </div>
      )}

      <button className={styles.newImageButton} onClick={handleSubmit}>
        <div className={styles.newImageContainer}>
          <Image src="/image/button/OK.png" alt="OK button" width={135} height={79} />
        </div>
      </button>
    </div>
  );
}
