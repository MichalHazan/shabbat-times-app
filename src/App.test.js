import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [location, setLocation] = useState(null);
  const [shabbatTimes, setShabbatTimes] = useState(null);
  const [cityName, setCityName] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedSound, setSelectedSound] = useState('bubble-pop-ding-betacut.mp3');
  const [notificationTime, setNotificationTime] = useState(null);
  const [selectedAlertTime, setSelectedAlertTime] = useState(5); // ברירת מחדל ל-5 דקות לפני כניסת שבת


  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(loc);
        await fetchCityName(loc.latitude, loc.longitude);
        await fetchShabbatTimes(loc.latitude, loc.longitude);
      });
    } else {
      alert('שירותי מיקום אינם זמינים בדפדפן זה.');
    }
  }, []);

  useEffect(() => {
    if (shabbatTimes && shabbatTimes.length > 0) {
      const entryTime = new Date(shabbatTimes[1].date);
      const now = new Date();
      const timeUntilNotification = entryTime - now - selectedAlertTime * 60 * 1000;

      if (timeUntilNotification > 0) {
        setTimeout(() => {
          notifyUser();
        }, timeUntilNotification);
      }
    }
  }, [shabbatTimes, selectedAlertTime]);

  const notifyUser = () => {
    if (Notification.permission === 'granted') {
      new Notification('התראת שבת', {
        body: `בעוד ${selectedAlertTime} דקות נכנסת שבת!`,
        icon: '/favicon.ico',
      });

      const audio = new Audio(`/sounds/${selectedSound}`);
      audio.play();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          notifyUser();
        }
      });
    }
  };

  const fetchShabbatTimes = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://www.hebcal.com/shabbat?cfg=json&m=50&latitude=${latitude}&longitude=${longitude}`
      );
      const data = await response.json();
      console.log('Shabbat Times JSON:', data);
      setShabbatTimes(data.items);
    } catch (error) {
      console.error('Error fetching Shabbat times:', error);
    }
  };

  const fetchCityName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=he`
      );
      const data = await response.json();
      setCityName(data.address.city || data.address.town || data.address.village);
    } catch (error) {
      console.error('Error fetching city name:', error);
    }
  };

  const handleCityChange = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityInput)}&accept-language=he`
      );
      const data = await response.json();
      if (data.length > 0) {
        const loc = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
        setLocation(loc);
        setCityName(data[0].display_name.split(',')[0]);
        await fetchShabbatTimes(loc.latitude, loc.longitude);
      } else {
        alert('עיר לא נמצאה, נסי שוב.');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const handleSoundChange = (event) => {
    const soundFile = event.target.value;
    setSelectedSound(soundFile);
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.play();
  };

  const handleAlertTimeChange = (event) => {
    setSelectedAlertTime(parseInt(event.target.value));
  };


  return (
    <div className="App">
      <header>
        <h1>זמני שבת</h1>
      </header>
      <div className="container">
      {location && cityName ? (
          <>
            <p>מיקום נוכחי: {cityName}</p>
            {shabbatTimes ? (
              <>
                <p>כניסת שבת יום שישי {new Date(shabbatTimes[1].date).toLocaleDateString('he-IL')}</p>
                <p>כניסת שבת: {new Date(shabbatTimes[0].date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
                <p>צאת שבת: {new Date(shabbatTimes[shabbatTimes.length - 1].date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
              </>
            ) : (
              <p>טוען זמני שבת...</p>
            )}
            <div>
              <input
                type="text"
                placeholder="הקלד עיר"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
              />
              <button onClick={handleCityChange}>שינוי עיר</button>
            </div>
            <div>
              <label htmlFor="soundSelect">בחר צליל:</label>
              <select
                id="soundSelect"
                value={selectedSound}
                onChange={handleSoundChange}
              >
                <option value="bubble-pop-ding-betacut.mp3">צליל 1</option>
                <option value="cartoon-game-upgrade-ni-sound.mp3">צליל 2</option>
                {/* הוסיפי כאן אפשרויות נוספות לצלילים */}
              </select>
            </div>
            <div>

<label htmlFor="alertTimeSelect">בחר זמן התראה:</label>

<select

  id="alertTimeSelect"

  value={selectedAlertTime}

  onChange={handleAlertTimeChange}

>

  {/* קפיצות של 5 דקות עד שעה */}

  {[...Array(12).keys()].map((i) => (

    <option key={i} value={(i + 1) * 5}>

      {`${(i + 1) * 5} דקות`}

    </option>

  ))}

  {/* קפיצות של שעה */}

  {[...Array(5).keys()].map((i) => (

    <option key={i + 12} value={(i + 1) * 60}>

      {`${(i + 1) * 60} דקות (שעה${i > 0 ? ` ${i + 1}` : ''})`}

    </option>

  ))}

</select>

</div>
          </>
        ) : (
          <p>מאתר מיקום...</p>
        )}
      </div>
    </div>
  );
}

export default App;
