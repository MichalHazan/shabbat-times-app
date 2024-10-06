import React, { useEffect, useState } from 'react';
import '../App.css';
import BackgroundMediaSelector from './BackgroundMediaSelector';
import './HeroSection.css';

function HeroSection() {
  const [location, setLocation] = useState(null);
  const [shabbatTimes, setShabbatTimes] = useState(null);
  const [cityName, setCityName] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedSound, setSelectedSound] = useState('bubble-pop-ding-betacut.mp3');
  const [notificationTime, setNotificationTime] = useState(null);
  const [selectedAlertTime, setSelectedAlertTime] = useState(5); // 5 minutes before Shabbat by default
  const [userText, setUserText] = useState('שבת שלום');
  const [backgroundMedia, setBackgroundMedia] = useState({ type: 'video', url: '/videos/video-1.mp4' });
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleBackgroundMediaChange = (newMedia) => {
    setBackgroundMedia(newMedia);
  };

  const handleUploadMedia = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const mediaDataUrl = reader.result;
      handleBackgroundMediaChange({
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: mediaDataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUserTextChange = (newText) => {
    setUserText(newText);
  };

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(loc);
        // Check if data is cached
        const cachedData = localStorage.getItem('shabbatTimes');
        const cachedCityName = localStorage.getItem('cityName');
        const cachedLastUpdated = localStorage.getItem('lastUpdated');

        const now = new Date();
        const lastUpdateDate = cachedLastUpdated ? new Date(cachedLastUpdated) : null;

        // If data is cached and was updated today, use it
        if (cachedData && cachedLastUpdated && isSameDay(now, lastUpdateDate)) {
          setShabbatTimes(JSON.parse(cachedData));
          setCityName(cachedCityName);
          setLastUpdated(lastUpdateDate);
        } else {
          // Otherwise, fetch new data
          await fetchCityName(loc.latitude, loc.longitude);
          await fetchShabbatTimes(loc.latitude, loc.longitude);
        }
      });
    } else {
      alert('שירותי מיקום אינם זמינים בדפדפן זה.');
    }
  }, []);
  const fetchShabbatTimes = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://www.hebcal.com/shabbat?cfg=json&m=50&latitude=${latitude}&longitude=${longitude}`
      );
      const data = await response.json();
      setShabbatTimes(data.items);
      // Cache the data with current timestamp
      localStorage.setItem('shabbatTimes', JSON.stringify(data.items));
      localStorage.setItem('lastUpdated', new Date().toISOString());
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
      const fetchedCityName = data.address.city || data.address.town || data.address.village;
      setCityName(fetchedCityName);
        // Cache city name
       localStorage.setItem('cityName', fetchedCityName);
    } catch (error) {
      console.error('Error fetching city name:', error);
    }
  };

  return (
    <div className="hero-container">
      {/* Background Media */}
      {backgroundMedia.type === 'video' ? (
        <video className="hero-background" src={backgroundMedia.url} autoPlay loop muted />
      ) : (
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${backgroundMedia.url})` }}
        />
      )}

      {/* Overlay Content */}
      <div className="hero-content">
        <h1>{userText}</h1>
        <h2>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const newText = prompt('Enter new text:', userText);
              if (newText) {
                handleUserTextChange(newText);
              }
            }}
          >
            שינוי כותרת
          </a>
        </h2>
        {shabbatTimes ? (
          <>
            <p>כניסת שבת ב{cityName} יום שישי {new Date(shabbatTimes[1].date).toLocaleDateString('he-IL')}</p>
            <p>כניסת שבת: {new Date(shabbatTimes[0].date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
            <p>צאת שבת: {new Date(shabbatTimes[shabbatTimes.length - 1].date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
          </>
        ) : (
          <p>טוען זמני שבת...</p>
        )}
        <BackgroundMediaSelector onBackgroundChange={handleBackgroundMediaChange} />
      </div>
    </div>
  );
}

export default HeroSection;
