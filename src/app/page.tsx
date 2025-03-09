'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './OverlayImage.module.css';

export default function Startpage() {
  const router = useRouter();

  // Function to send a request to the backend to start the game.
  const handlePlayClick = async () => {
    try {
      // const response = await fetch("http://localhost:8080/api/startGame", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   // Send any necessary initialization data. Here we send a simple action command.
      //   body: JSON.stringify({ action: "start" })
      // });
      // const data = await response.text();
      // console.log("Backend response:", data);
      // After a successful response, navigate to the mode selection page.
      router.push('/selectmode');
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

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
          width={1200}
          height={320}
          layout="responsive"
        />
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handlePlayClick}>
          <Image 
            src="/image/button/PLAY.png"
            alt="PLAY button"
            width={600}
            height={240}
          />
        </button>
        <button className={styles.button} onClick={() => router.push('/tutorial')}>
          <Image 
            src="/image/button/TUTORIAL.png"
            alt="TUTORIAL button"
            width={600}
            height={240}
          />
        </button>
      </div>
    </div>
  );
}
