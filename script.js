const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const weatherDataDiv = document.querySelector(".weather-data");

const API_KEY = "0d77e45a47f6b04e1207e065f3e918b8"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, country, weatherItem, index) => {
    if (index === 0) {
        return `
        <div class="details">
            <h2>${cityName}, ${country} (${weatherItem.dt_txt.split(" ")[0]})</h2>
            <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
            <h6>Wind: ${weatherItem.wind.speed} m/s</h6>
            <h6>Humidity: ${weatherItem.main.humidity}%</h6>
        </div>
        <div class="icon">
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
            <h6>${weatherItem.weather[0].description}</h6>
        </div>`;
    } else {
        return `
        <div class="card">
            <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
            <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
            <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
        </div>`;
    }
};

const fetchWeatherData = async (city) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`);
        const data = await response.json();

        if (data.cod === "200") {
            weatherDataDiv.classList.remove("hidden");

            const cityName = data.city.name;
            const country = data.city.country;
            const weatherData = data.list;

            // Get unique daily data (every 24 hours)
            let dailyWeather = [];
            let lastDate = "";
            for (let i = 0; i < weatherData.length; i++) {
                const currentDate = weatherData[i].dt_txt.split(" ")[0]; // Extract the date part
                if (currentDate !== lastDate) {
                    dailyWeather.push(weatherData[i]);
                    lastDate = currentDate;
                }
                if (dailyWeather.length === 6) break; // Only get 5 days of data
            }

            // Display current weather and 5-day forecast
            currentWeatherDiv.innerHTML = createWeatherCard(cityName, country, dailyWeather[0], 0);
            weatherCardsDiv.innerHTML = dailyWeather.slice(1).map((weatherItem, index) => createWeatherCard(cityName, country, weatherItem, index + 1)).join('');
        } else {
            alert("City not found. Please try again.");
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred while fetching weather data. Please try again.");
    }
};

searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        alert("Please enter a city name.");
    }
});

locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
            const data = await response.json();
            const cityName = data.city.name;
            fetchWeatherData(cityName);
        }, () => {
            alert("Unable to retrieve location.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});
