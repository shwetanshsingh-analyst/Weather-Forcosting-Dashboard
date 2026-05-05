/* ============================================================
   WeatherScope Pro Redesigned — app.js
   API: Open-Meteo (free, no API key required)
   Version: 3.0 — Stormy Theme Dashboard
   ============================================================ */

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// DOM refs
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMsg = document.getElementById('errorMsg');
const loader = document.getElementById('loader');
const weatherSection = document.getElementById('weatherSection');
const locationText = document.getElementById('locationText');

// Weather icon SVG library (Orange/Gold theme)
const WEATHER_ICONS = {
  // Clear/Sunny
  clearDay: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="12" stroke="currentColor" stroke-width="3" fill="none"/>
    <line x1="32" y1="4" x2="32" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <line x1="32" y1="52" x2="32" y2="60" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <line x1="4" y1="32" x2="12" y2="32" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <line x1="52" y1="32" x2="60" y2="32" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <line x1="12.1" y1="12.1" x2="17.7" y2="17.7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <line x1="46.3" y1="46.3" x2="51.9" y2="51.9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <line x1="51.9" y1="12.1" x2="46.3" y2="17.7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <line x1="17.7" y1="46.3" x2="12.1" y2="51.9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // Cloudy
  cloudy: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 42C16 42 12 38 12 32C12 27 15 24 19 23C20 17 25 13 31 13C37 13 42 18 42 24C42 24.2 42 24.4 42 24.6C45 25 48 27 48 31C48 35 45 39 41 40H22Z" 
      stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
  </svg>`,

  // Rainy
  rainy: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 42C16 42 12 38 12 32C12 27 15 24 19 23C20 17 25 13 31 13C37 13 42 18 42 24C42 24.2 42 24.4 42 24.6C45 25 48 27 48 31C48 35 45 39 41 40H22Z" 
      stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    <line x1="18" y1="45" x2="16" y2="52" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="32" y1="45" x2="30" y2="52" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="46" y1="45" x2="44" y2="52" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  // Thunderstorm
  thunderstorm: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 42C16 42 12 38 12 32C12 27 15 24 19 23C20 17 25 13 31 13C37 13 42 18 42 24C42 24.2 42 24.4 42 24.6C45 25 48 27 48 31C48 35 45 39 41 40H22Z" 
      stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    <path d="M26 45L22 52L28 52L24 60" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M40 45L36 52L42 52L38 60" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // Snow
  snow: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 42C16 42 12 38 12 32C12 27 15 24 19 23C20 17 25 13 31 13C37 13 42 18 42 24C42 24.2 42 24.4 42 24.6C45 25 48 27 48 31C48 35 45 39 41 40H22Z" 
      stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    <circle cx="20" cy="48" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="32" cy="48" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="44" cy="48" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="20" cy="56" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="32" cy="56" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="44" cy="56" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
  </svg>`,

  // Default
  default: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="20" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="32" cy="32" r="3" fill="currentColor"/>
  </svg>`
};

// Event listeners
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) searchCity(city);
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = cityInput.value.trim();
    if (city) searchCity(city);
  }
});

// Search city and fetch weather
async function searchCity(cityName) {
  errorMsg.textContent = '';
  
  try {
    // Get coordinates
    const geoResponse = await fetch(`${GEO_API}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
    const geoData = await geoResponse.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      errorMsg.textContent = `City "${cityName}" not found. Please try again.`;
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    locationText.textContent = `${name}, ${country || ''}`;

    // Show loader
    loader.classList.add('active');
    weatherSection.style.display = 'none';

    // Fetch weather data
    const weatherResponse = await fetch(
      `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=7`
    );
    const weatherData = await weatherResponse.json();

    // Update UI
    updateWeatherUI(weatherData, name);
    
    loader.classList.remove('active');
    weatherSection.style.display = 'grid';

  } catch (error) {
    console.error('Error:', error);
    errorMsg.textContent = 'Failed to fetch weather data. Please try again.';
    loader.classList.remove('active');
  }
}

// Update UI with weather data
function updateWeatherUI(data, cityName) {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Update header
  document.getElementById('headerTime').textContent = timeString;
  document.getElementById('dateDisplay').textContent = dateString;

  // Current weather (use first hourly data)
  const currentTemp = Math.round(data.hourly.temperature_2m[0]);
  const currentWeatherCode = data.hourly.weather_code[0];
  const feelsLike = Math.round(currentTemp - 2); // Estimate
  const weatherDesc = getWeatherDescription(currentWeatherCode);

  document.getElementById('tempMain').textContent = `${currentTemp}°C`;
  document.getElementById('weatherDesc').textContent = `Feels like ${feelsLike}°C. ${weatherDesc}. Light breeze`;

  // Card temperatures (simulate indoor/outdoor variation)
  const streetTemp = currentTemp - 2;
  const indoorTemp = currentTemp + 4;
  
  document.getElementById('streetTemp').textContent = `${streetTemp}°C`;
  document.getElementById('indoorTemp').textContent = `${indoorTemp}°C`;

  // Sunrise/Sunset
  if (data.daily.sunrise && data.daily.sunrise[0]) {
    const sunrise = new Date(data.daily.sunrise[0]);
    const riseTime = sunrise.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    document.getElementById('riseSetTime').textContent = riseTime + ':39';
  }

  // Metrics
  const windSpeed = data.hourly.wind_speed_10m[0];
  document.getElementById('windValue').textContent = `${windSpeed.toFixed(1)} m/s`;

  // AQI (simulate based on weather code)
  const aqi = getAQIFromWeather(currentWeatherCode);
  document.getElementById('aqiValue').textContent = aqi.toString();

  // Pressure (simulate)
  const pressure = (753 + Math.random() * 40).toFixed(0);
  document.getElementById('pressureValue').textContent = `${pressure} mmHg`;

  // Humidity
  const humidity = Math.round(30 + Math.random() * 50);
  document.getElementById('humidityValue').textContent = `${humidity} %`;

  // Hourly forecast
  updateHourlyForecast(data);

  // Weekly forecast
  updateWeeklyForecast(data);
}

// Update hourly forecast
function updateHourlyForecast(data) {
  const hourlyGrid = document.getElementById('hourlyGrid');
  hourlyGrid.innerHTML = '';

  const now = new Date();
  const currentHour = now.getHours();

  for (let i = 0; i < 7; i++) {
    const hourIndex = currentHour + i;
    const hour = hourIndex % 24;
    const hourTime = String(hour).padStart(2, '0') + ':00';
    
    const temp = Math.round(data.hourly.temperature_2m[hourIndex] || data.hourly.temperature_2m[0]);
    const weatherCode = data.hourly.weather_code[hourIndex] || data.hourly.weather_code[0];

    const hourlyItem = document.createElement('div');
    hourlyItem.className = 'hourly-item';
    hourlyItem.innerHTML = `
      <span class="hour-time">${hourTime}</span>
      <div class="hour-icon">${getWeatherIcon(weatherCode)}</div>
      <span class="hour-temp">${temp}°C</span>
    `;
    hourlyGrid.appendChild(hourlyItem);
  }
}

// Update weekly forecast
function updateWeeklyForecast(data) {
  const weeklyList = document.getElementById('weeklyList');
  weeklyList.innerHTML = '';

  const now = new Date();

  for (let i = 0; i < data.daily.time.length; i++) {
    const date = new Date(data.daily.time[i]);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const high = Math.round(data.daily.temperature_2m_max[i]);
    const low = Math.round(data.daily.temperature_2m_min[i]);
    const weatherCode = data.daily.weather_code[i];

    const weeklyDay = document.createElement('div');
    weeklyDay.className = 'weekly-day';
    weeklyDay.innerHTML = `
      <div class="day-date">
        <div class="day-name">${dayName}</div>
        <div class="day-label">${dateStr}</div>
      </div>
      <div class="day-weather">
        <div class="day-icon">${getWeatherIcon(weatherCode)}</div>
      </div>
      <div class="day-temps">
        <span class="day-high">+${high}°</span>
        <span class="day-low">+${low}°</span>
      </div>
    `;
    weeklyList.appendChild(weeklyDay);
  }
}

// Get weather description from code
function getWeatherDescription(code) {
  if (code === 0 || code === 1) return 'Clear sky';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code === 51 || code === 53 || code === 55) return 'Light drizzle';
  if (code === 61 || code === 63 || code === 65) return 'Rainy';
  if (code === 71 || code === 73 || code === 75) return 'Snowy';
  if (code === 77) return 'Snow grains';
  if (code === 80 || code === 81 || code === 82) return 'Rain showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code === 95 || code === 96 || code === 99) return 'Thunderstorm';
  return 'Variable clouds';
}

// Get AQI estimate from weather code
function getAQIFromWeather(code) {
  if (code === 0 || code === 1) return 30; // Clear
  if (code === 2 || code === 3) return 45;
  if (code === 45 || code === 48) return 60; // Fog
  if (code >= 51 && code <= 82) return 55; // Precipitation
  if (code >= 95 && code <= 99) return 75; // Storms
  return 50;
}

// Get weather icon SVG
function getWeatherIcon(code) {
  if (code === 0 || code === 1) return WEATHER_ICONS.clearDay;
  if (code === 2 || code === 3) return WEATHER_ICONS.cloudy;
  if (code >= 51 && code <= 82) return WEATHER_ICONS.rainy;
  if (code >= 85 && code <= 86) return WEATHER_ICONS.snow;
  if (code >= 95 && code <= 99) return WEATHER_ICONS.thunderstorm;
  return WEATHER_ICONS.default;
}

// Load default city on start
window.addEventListener('load', () => {
  searchCity('Almaty');
  initRain();
});

/* ── Rain Effect ─────────────────────────────────────────── */
function initRain() {
  const container = document.getElementById('rainContainer');
  if (!container) return;

  const DROP_COUNT = 110;

  for (let i = 0; i < DROP_COUNT; i++) {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';

    // Randomise position, size, speed, delay
    const x        = Math.random() * 110 - 5;          // -5% … 105% (bleed edges)
    const height   = 14 + Math.random() * 28;           // 14px – 42px
    const opacity  = 0.18 + Math.random() * 0.45;       // subtle variation
    const duration = 0.55 + Math.random() * 0.65;       // 0.55s – 1.2s
    const delay    = -(Math.random() * duration * 3);   // stagger so they don't all start together

    drop.style.cssText = `
      left:              ${x}%;
      height:            ${height}px;
      opacity:           ${opacity};
      animation-duration:${duration}s;
      animation-delay:   ${delay}s;
    `;

    container.appendChild(drop);
  }
}
