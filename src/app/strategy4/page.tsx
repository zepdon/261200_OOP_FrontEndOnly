import React from 'react';
import Image from 'next/image';
import styles from './Strategy.module.css'; // Import the CSS file

export default function StrategyPage() {
  return (
    <div className={styles.container}>
      {/* Container for the first image and input */}
      <div className={styles.imageAndInputContainer}>
        {/* Image */}
        <div className={styles.imageContainer}>
          <Image
            src="/image/word/Create name.png" // Path to the image
            alt="Create Name"
            width={275} // Set the width of the image
            height={34} // Set the height of the image
          />
        </div>

        {/* Text Input */}
        <div className={styles.inputContainer}>
          <input type="text" placeholder="Enter your minion name" />
        </div>
      </div>

      {/* Container for the second image and input */}
      <div className={styles.strategyAndInputContainer}>
        {/* Second Image */}
        <div className={styles.strategyContainer}>
          <Image
            src="/image/word/STRATEGY MINION.png" // Path to the second image
            alt="Strategy Minion"
            width={724} // Set the width of the image
            height={56} // Set the height of the image
          />
        </div>

        {/* Second Text Input */}
        <div className={styles.strategyInputContainer}>
        <textarea placeholder="Type your minion strategy here" />
        </div>
        
      </div>
      <div className={styles.parentContainer}>
  {/* Other content */}
  <div className={styles.minionContainer}>
    <Image
      src="/image/component/minion4.png" // Path to the image
      alt="Minion1"
      width={379} // Set the width of the image
      height={471} // Set the height of the image
    />
  </div>
</div>
<div className={styles.defImageAndInputContainer}>
  

  <div className={styles.defImageContainer}>
    <Image
      src="/image/word/DEF.png"
      alt="def"
      width={114}
      height={40}
    />
  </div>
  
  <div className={styles.defInputContainer}>
    <input type="text" placeholder="Enter your minion DEF" />
  </div>

  
</div>
<button className={styles.newImageButton} >
    <div className={styles.newImageContainer}>
      <Image
        src="/image/button/OK.png" // New button image
        alt="new button"
        width={135}  // Adjust width as necessary
        height={79} // Adjust height as necessary
      />
    </div>
  </button>
</div>
  );
}