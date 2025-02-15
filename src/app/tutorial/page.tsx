"use client";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Tutorialpage.module.css';

export default function TutorialPage() {
  const router = useRouter(); // Use Next.js router for navigation

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
      </div>

      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={() => router.push('/')}>
          <Image 
            src="/image/button/Back to Start.png"
            alt="BACK TO START button"
            width={350}  
            height={120} 
          />
        </button>
      </div>
    </div>
  );
}
