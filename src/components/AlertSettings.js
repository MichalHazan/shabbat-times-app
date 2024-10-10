import React, { useEffect, useState } from 'react';

const AlertSettings = ({ onClose, candleLightingTime }) => {
  const [alertTime, setAlertTime] = useState(5); // default alert time
  const [selectedSound, setSelectedSound] = useState('');
  const [timeoutId, setTimeoutId] = useState(null); // To store timeout ID

  const sounds = [
    { name: 'bubble-pop', value: 'bubble-pop-ding-betacut.mp3' },
    { name: 'cartoon-game', value: 'cartoon-game-upgrade-ni-sound.mp3' },
    { name: 'level-complete', value: 'level-complete-mobile-game-app-locran-1-00-06.mp3' },
    { name: 'cuckoo', value: 'cuckoo-9-94258.mp3' },
  ];

  // Function to play sound
  const playSound = (sound) => {
    const audio = new Audio(`/sounds/${sound}`);
    audio.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  };

  const handleSave = () => {
    const candleLightingDate = new Date(candleLightingTime);
    const alertDate = new Date(candleLightingDate.getTime() - alertTime * 60 * 1000); // Convert minutes to milliseconds
  
    // Create an audio instance
    const sound = new Audio(`/sounds/${selectedSound}`); 
  
    const timeoutId = setTimeout(() => {
      // Play the sound
      sound.play().then(() => {
        // Wait until sound finishes playing before showing the alert
        sound.onended = () => {
          alert(`More ${alertTime} minutes to light the candles!`);
        };
      }).catch((error) => {
        console.error("Error playing sound:", error);
        alert(`More ${alertTime} minutes to light the candles!`); // Fallback if sound fails to play
      });
    }, alertDate - new Date());
  
    return () => clearTimeout(timeoutId);
  };
  

  const handleSoundChange = (e) => {
    const sound = e.target.value;
    setSelectedSound(sound);
    playSound(sound); // Play sound immediately when selected
  };

  const handleSaveAndClose = () => {
    handleSave(); // Call save function
    onClose(); // Close the popup
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <div className="alert-settings-popup">
      <div className='content'>
      <h2>הוספת התראה להדלקת נרות</h2>
      <label>
        זמן בדקות לפני  הדלקת נרות:
        <select value={alertTime} onChange={(e) => setAlertTime(e.target.value)}>
          {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((time) => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
      </label>
      <br></br>
      <label>
        צליל התראה:
        <select value={selectedSound} onChange={handleSoundChange}>
          <option value="">בחירת צליל</option>
          {sounds.map((sound) => (
            <option key={sound.value} value={sound.value}>{sound.name}</option>
          ))}
        </select>
      </label>
      <br></br>
      <button onClick={handleSaveAndClose}>Save</button>
      <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default AlertSettings;
