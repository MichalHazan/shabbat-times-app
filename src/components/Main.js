import React, { useEffect, useState } from 'react';
import candleImage from '../images/candle.png';
import AlertSettings from './AlertSettings';
import './Main.css';
import ParashatHashavua from './ParashatHashavua';
import ShabbatImage from './ShabbatImage';

function Main() {
  const [shabbatTimes, setShabbatTimes] = useState(null);
  const [cityName, setCityName] = useState('');
  const [location, setLocation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showParashatHashavua, setShowParashatHashavua] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [imageSrc, setImageSrc] = useState(candleImage); // Default image
  const [text, setText] = useState('לעילוי נשמת');
  const [parashatHashavua, setParashatHashavua] = useState("");
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [candleLightingTime, setCandleLightingTime] = useState();

  useEffect(() => {
    const handleTouchStart = (e) => {
      setTouchStartX(e.changedTouches[0].screenX);
    };

    const handleTouchEnd = (e) => {
      setTouchEndX(e.changedTouches[0].screenX);
      handleSwipeGesture();
      
    };

    const handleSwipeGesture = () => {
      const swipeThreshold = 50; // Minimum distance to trigger swipe

      if (touchStartX - touchEndX > swipeThreshold) {
        // Swipe Left (Show Parashat Hashavua)
        setShowParashatHashavua(true);
      }

      if (touchEndX - touchStartX > swipeThreshold) {
        // Swipe Right (Show Shabbat Image)
        setShowParashatHashavua(false);
      }

    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStartX, touchEndX]);


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

  
  const get_havdalah_time = () => {
    const havdalah_event = shabbatTimes.find(event => event.category === "havdalah");
    return havdalah_event
      ? new Date(havdalah_event.date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
      : "לא נמצא";
  };
  useEffect(() => {
    if (shabbatTimes && shabbatTimes.length > 0) {
      const parashaEvent = shabbatTimes.find(event => event.category === "parashat");
      const candleLightingEvent = shabbatTimes.find(event => event.category === "candles");
    if (candleLightingEvent) {
      setCandleLightingTime(new Date(candleLightingEvent.date));
      // testing
      // setCandleLightingTime(new Date('2024-09-29T21:01:10+03:00'));
      // console.log(candleLightingTime)
      
    }
      if (parashaEvent) {
        setParashatHashavua(parashaEvent.hebrew);
      } else{
        setParashatHashavua(shabbatTimes[2].hebrew);
      }
    }
  }, [shabbatTimes]); // Runs only when shabbatTimes changes
  
  
  return (
    <div className="shabbat-container">
      <div className="shabbat-text">
        <div className="shabbat-times">
        {shabbatTimes ? (
          <>
               <p>הדלקת נרות: {candleLightingTime && candleLightingTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
   
             <p>הבדלה: {get_havdalah_time()}</p>
          </>
        ) : (
          <p>טוען זמני שבת...</p>
        )}
         </div>
        <div className="shabbat-prayer">
          <p dir="rtl">“בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, 
אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ 
לְהַדְלִיק נֵר שֶׁל שַׁבָּת קֹדֶשׁ “</p>
        </div>
      </div>

        {/* Show ParashatHashavua or ShabbatImage based on swipe */}
        {showParashatHashavua ? (
       <ParashatHashavua parashatHashavua={parashatHashavua} />
      ) : (
        <ShabbatImage
          imageSrc={imageSrc}
          text={text}
          setImageSrc={setImageSrc}
          setText={setText}
        />
      )}
     {/* Bottom menu bar */}
     <div className="bottom-menu">
        <button className="menu-btn" onClick={() => setShowAlertSettings(true)}>הוספת התראה</button>
      </div>

   {/* Popup for alert settings */}
   {showAlertSettings && (
        <AlertSettings onClose={() => setShowAlertSettings(false)} candleLightingTime={candleLightingTime} />
      )}
      
    </div>
  )
}

export default Main
