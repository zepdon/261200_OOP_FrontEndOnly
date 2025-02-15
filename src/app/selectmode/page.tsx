'use client'
import React from 'react';
import styles from './selectmode.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return (
    <div className={styles.imageContainer}>
      <div className={styles.backgroundImage}>
        <Image
          src="/image/background/ModePage.png"
          alt="Descriptive text for screen readers"
          width={1440}
          height={1024}
          layout="responsive"
        />
      </div>

      <div className={styles.buttonWrapper}>
        <div className={styles.buttonWithText}>
          <button className={styles.button} onClick={() => router.push('/selectminion')}>
            <Image
              src="/image/button/1VS1.png"
              alt="1VS1 button"
              width={314}
              height={314}
            />
          </button>
          <Image
            src="/image/word/1VS1 HEX MAP.png" // Path to the word image
            alt="1VS1 Text"
            width={140} // Adjust width as needed
            height={84} // Adjust height as needed
          />
        </div>

        <div className={styles.buttonWithText}>
          <button className={styles.button}>
            <Image
              src="/image/button/1VSAI.png"
              alt="1VSAI button"
              width={314}
              height={314}
            />
          </button>
          <Image
            src="/image/word/1VSAI HEX MAP.png" // Path to the word image
            alt="1VS AI Text"
            width={140} // Adjust width as needed
            height={84} // Adjust height as needed
          />
        </div>

        <div className={styles.buttonWithText}>
          <button className={styles.button}>
            <Image
              src="/image/button/AIVSAi.png"
              alt="AIVSAI button"
              width={314}
              height={314}
            />
          </button>
          <Image
            src="/image/word/AI VS AI HEX MAP.png" // Path to the word image
            alt="AI VS AI Text"
            width={160} // Adjust width as needed
            height={84} // Adjust height as needed
          />
        </div>
      </div>
    </div>
  );
}