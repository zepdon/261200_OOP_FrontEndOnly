"use client";
import Image from 'next/image';
import styles from './OverlayImage.module.css';

export default function Startpage() {
  return (
    <div className={styles.imageContainer}>
      <div className={styles.backgroundImage}>
        <Image
          src="/image/background/StartPage.png"
          alt="Descriptive text for screen readers"
          width={1440}
          height={1024}
          layout="responsive"
        />
      </div>
      <div className={styles.foregroundImage}>
        <Image 
          src="/image/word/KOMBAT GAME.png"
          alt="Logo for KOMBAT GAME, featuring bold lettering with a dynamic design"
          width={1200}  // Increased width
          height={320}  // Increased height
          layout="responsive"
        />
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.button}>
          <Image 
            src="/image/button/PLAY.png"
            alt="PLAY button"
            width={600}  // Increased width
            height={240} // Increased height
          />
        </button>
        <button className={styles.button}>
          <Image 
            src="/image/button/TUTORIAL.png"
            alt="TUTORIAL button"
            width={600}  // Increased width
            height={240} // Increased height
          />
        </button>
      </div>
    </div>
  );
}