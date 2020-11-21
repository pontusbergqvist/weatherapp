const App = (function() {

  // API Docs:
  // https://openweathermap.org/current
  // https://openweathermap.org/api/one-call-api

  // DOM caching:

  const API_KEY_WEATHER = "176e50afdbf38f07708bd670b0317aa6"
  const URL_WEATHER = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY_WEATHER}&q=`
  const URL_WEATHER_FORECAST = `https://api.openweathermap.org/data/2.5/onecall`;
  const inputEl = document.querySelector(".location-input");
  const buttonEl = document.querySelector(".input__search");
  const currentLocationEl = document.querySelector(".current__location");
  const dateEl = document.querySelector(".section-title");
  const currentWeatherEl = document.querySelector(".temp__display");
  const tempStateEl = document.querySelector(".temp__state")
  const highestTempEl = document.querySelector(".highest-temp");
  const windspeedEl = document.querySelector(".windspeed");
  const sunriseEl = document.querySelector(".sunrise")
  const lowestTempEl = document.querySelector(".lowest-temp");
  const rainEl = document.querySelector(".rainpercentage");
  const sunsetEl = document.querySelector(".sunset");
  const forecastItems = [...document.querySelector(".forecast__list").children];

  // Utility functions:

  // Input location, input reset and default location for onload call:
  const locationObj = (function() {
    return {
      getLocation: function() {
        return inputEl.value;
      },
      resetLocation: function() { 
        inputEl.value = "";
      }, 
      defaultLocation: function() {
        return "mölnlycke";
      }
    }
  })();

// Methods for converting Date object properties to the correct format:
  const date = (function() {
    const dateObject = new Date;
    return {
      getWeekDay: function(obj = dateObject) {
        if (obj.getDay() === 0) {
          return "Sunday"
        } else if (obj.getDay() === 1) {
          return "Monday"
        } else if (obj.getDay() === 2) {
          return "Tuesday"
        } else if (obj.getDay() === 3) {
          return "Wednesday"
        } else if (obj.getDay() === 4) {
          return "Thursday"
        } else if (obj.getDay() === 5) {
          return "Friday"
        } else {
          return "Saturday"
        }
      },
      getDay: function() {
        return dateObject.getDate()
      },
      getMonth: function(object = dateObject) {
        if (object.getMonth() === 0) {
          return "January"
        } else if (object.getMonth() === 1) {
          return "February"
        } else if (object.getMonth() === 2) {
          return "Mars"
        } else if (object.getMonth() === 3) {
          return "April"
        } else if (object.getMonth() === 4) {
          return "May"
        } else if (object.getMonth() === 5) {
          return "June"
        } else if (object.getMonth() === 6) {
          return "July"
        } else if (object.getMonth() === 7) {
          return "August"
        } else if (object.getMonth() === 8) {
          return "September"
        } else if (object.getMonth() === 9) {
          return "October"
        } else if (object.getMonth() === 10) {
          return "November"
        } else {
          return "December"
        }
      }, 
      getTime: function(ms) {
        let result = String(new Date(ms));
        return result.split(" ")[4].split(":").slice(0, 2).join(":");
      }, 
      getIndex: function() {
        return dateObject.getDay();
      },
      displayDate: function() {
        return `${date.getWeekDay()}, ${date.getDay()} ${date.getMonth()}`
      }
    }
  })();

  const kelvinToCelsius = function(temp) {
    return Math.round(temp - 273.15);
  }

  const getIcon = function(data) {
    return `<img src="https://openweathermap.org/img/wn/${data}@2x.png" alt="Weather icon">`
  }

  // Output for the fetched data to document:

  const setValues = function(data, cb) {
    currentLocationEl.textContent = `${data.name}, ${data.sys.country}`;
    currentWeatherEl.innerHTML = `${getIcon(data.weather[0].icon)}${kelvinToCelsius(data.main.temp)}°`;
    tempStateEl.textContent = `${data.weather[0].description.toUpperCase()}`;
    highestTempEl.textContent = `${kelvinToCelsius(data.main.temp_max)}°`;
    lowestTempEl.textContent = `${kelvinToCelsius(data.main.temp_min)}°`;
    windspeedEl.textContent = `${data.wind.speed}mph`;
    rainEl.textContent = `${data.main.humidity}%`;
    sunriseEl.textContent = `${date.getTime(data.sys.sunrise * 1000)}`; // * 1000 to convert from unix timestamp
    sunsetEl.textContent = `${date.getTime(data.sys.sunset * 1000)}`;  // * 1000 to convert from unix timestamp
    cb(data);
  }

  const setForecastValues = function(data) {
    forecastItems.forEach((item, index) => {
      let unixToDate = new Date(data.daily[index + 1].dt * 1000);
      item.children[0].textContent = date.getWeekDay(unixToDate)
      item.children[1].innerHTML = getIcon(data.daily[index + 1].weather[0].icon);
      item.children[2].textContent = `${kelvinToCelsius(data.daily[index + 1].temp.day)}°`;
    })
  }

  // API call functions:

  // Current Weather Data API:
  const fetchWeather = function(loc = locationObj.getLocation) {
    fetch(`${URL_WEATHER}${loc()}`)
    .then(response => response.json())
    .then(data => setValues(data, fetchWeatherForecast))
    .catch(err => alert("Location not found, try again :)"))
    inputEl.value = "";
  }

  // Open Weather Map, One Call API:
  const fetchWeatherForecast = function(data) {
    const FORECAST_QUERY = `?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=current,minutely,hourly,alerts&appid=${API_KEY_WEATHER}`
    fetch(`${URL_WEATHER_FORECAST}${FORECAST_QUERY}`)
    .then(response => response.json())
    .then(data => setForecastValues(data));
  }

  // Event listeners: 

  const fetchEvent = function(event) {
    if (event.key === "Enter") {
      fetchWeather();
    }
  }

  const setListeners = function() {
    buttonEl.addEventListener("click", fetchWeather)
    inputEl.addEventListener("keypress", fetchEvent)
  }

  // Onload init:

  const init = function() {
    setListeners();
    dateEl.textContent = date.displayDate();
    fetchWeather(locationObj.defaultLocation); // Shows weather data for Mölnlycke by default
  }

  return {
    init
  }
})();

export default App;