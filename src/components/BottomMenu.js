import React, { useState } from 'react';
import AlertSettingsPopup from './AlertSettingsPopup';

function BottomMenu({ candleLightingTime }) {
  const [showPopup, setShowPopup] = useState(false);
  const [alertTime, setAlertTime] = useState(0); // in minutes
  const [selectedSound, setSelectedSound] = useState('sound1'); // Default sound
  const [alertTimeoutId, setAlertTimeoutId] = useState(null); // Store timeout ID

  const handleSave = () => {
    // Clear existing timeout if any
    if (alertTimeoutId) {
      clearTimeout(alertTimeoutId);
    }

    // Calculate alert time based on the selected minutes
    const alertTimeInMs = alertTime * 60 * 1000; // Convert to milliseconds

    // Get the current time and candle lighting time
    const currentTime = new Date();
    const candleLightingDate = new Date(`1970-01-01T${candleLightingTime}:00+03:00`);

    // Calculate when to trigger the alert
    const alertTriggerTime = candleLightingDate.getTime() - alertTimeInMs;

    // Set timeout to alert at the calculated time
    const newTimeoutId = setTimeout(() => {
      playAlertSound(selectedSound);
      alert(`שבת נכנסת בעוד ${alertTime} דקות!`); // Alert message
    }, alertTriggerTime - currentTime.getTime());

    setAlertTimeoutId(newTimeoutId);
    setShowPopup(false); // Close the popup
  };

  const playAlertSound = (sound) => {
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.play();
  };

  return (
    <div className="bottom-menu">
      <button className="menu-btn" onClick={() => setShowPopup(true)}>הוספת התראה</button>
      {showPopup && (
        <AlertSettingsPopup
          onSave={handleSave}
          setAlertTime={setAlertTime}
          setSelectedSound={setSelectedSound}
          closePopup={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

export default BottomMenu;
