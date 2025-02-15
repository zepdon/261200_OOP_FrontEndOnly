import React from 'react';
import  styles  from './Tutorialpage.module.css'; // Import the CSS file
import Image from 'next/image';

export default function Tutorialpage() {
  return (
    <div className={styles.imageContainer}>
      <div className={styles.backgroundImage}>
        <Image
          src="/image/background/TutorialPage.png"
          alt="Descriptive text for screen readers"
          width={1440}
          height={1024}
          layout="responsive"
        />

        <div  className={styles.buttonContainer}>
          <div style={{justifyContent: "center"}}>
        <button className={styles.button}>
          <Image 
            src="/image/button/Back to Start.png"
            alt="PLAY button"
            width={600}  // Increased width
            height={240} // Increased height
          />
        </button>
        </div>
      </div>
      </div>
    </div>
  );
}