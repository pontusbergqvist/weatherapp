const App = (function() {

  // API Docs:
  // https://openweathermap.org/current
  // https://openweathermap.org/api/one-call-api

  // DOM caching:
  const API_KEY_WEATHER = "176e50afdbf38f07708bd670b0317aa6";
  const URL_WEATHER = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY_WEATHER}&q=`;
  const URL_WEATHER_FORECAST = `https://api.openweathermap.org/data/2.5/onecall`;
  const appEl = document.querySelector(".app");
  const spinnerEl = document.querySelector(".spinner");
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
  const fbuttonEl = document.querySelector(".f-temp");
  const cbuttonEl = document.querySelector(".c-temp")


  // Utility functions:

  // Input location, input reset and default location for onload call:
  const locationObj = (function() {
    return {
      getLocation() {
        return inputEl.value;
      },
      resetLocation() { 
        inputEl.value = ""
      }, 
      getDefaultLocation() {
        return "Mölnlycke"
      },
    }
  })();

  // Methods for converting Date object properties to the correct format:
  const date = (function() {
    const dateObject = new Date;
    return {
      getWeekDay(obj = dateObject) {
        const week = {
          Sunday: 0,
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6 
        };
        for (let day in week) {
          if (week[day] === obj.getDay()) {
            return day;
          }
        }
      },
      getDay() {
        return dateObject.getDate();
      },
      getMonth(obj = dateObject) {
        const year = {
          January: 0,
          February: 1,
          Mars: 2,
          April: 3,
          May: 4,
          June: 5,
          July: 6,
          August: 7,
          September: 8,
          October: 9,
          November: 10,
          December: 11
        };
        for (let month in year) {
          if (year[month] === obj.getMonth()) {
            return month;
          }
        }
      },
      getTime(ms) {
        let result = String(new Date(ms));
        return result.split(" ")[4].split(":").slice(0, 2).join(":");
      }, 
      getIndex() {
        return dateObject.getDay();
      },
      displayDate() {
        return `${date.getWeekDay()}, ${date.getDay()} ${date.getMonth()}`;
      }
    }
  })();

  // Functions for converting and displaying temperature:
  const kelvinToCelsius = function(temp) {
    return Math.round(temp - 273.15);
  }

  const kelvinToFahrenheit = function(temp) {
    return Math.round(temp * 9 / 5 - 459.69);
  }

  const tempControl = function(temp) {
    return cbuttonEl.classList.contains("active") ? kelvinToCelsius(temp) : kelvinToFahrenheit(temp);
  }

  const unitControl = function() {
    return cbuttonEl.classList.contains("active") ? "C" : "F";
  }

  const getIcon = function(data) {
    return `<img src="https://openweathermap.org/img/wn/${data}@2x.png" alt="Weather icon">`;
  }

  // Remove loading spinner and show data:
  const onSuccesfulLoad = function() {
    appEl.classList.add("loaded");
    spinnerEl.classList.add("loaded");
  }
  
  // Initiate spinner after new search:
  const initiateSpinner = function() {
    appEl.classList.remove("loaded");
    spinnerEl.classList.remove("loaded");
  }

  // Output for the fetched data to document:

  // If server uses HTTP:
  const setValues = function(data, setForecast) {
    onSuccesfulLoad()
    currentLocationEl.textContent = `${data.name}, ${data.sys.country}`;
    currentWeatherEl.innerHTML = `${getIcon(data.weather[0].icon)}${tempControl(data.main.temp)}°${unitControl()}`;
    tempStateEl.textContent = `${data.weather[0].description.toUpperCase()}`;
    highestTempEl.textContent = `${tempControl(data.main.temp_max)}°${unitControl()}`;
    lowestTempEl.textContent = `${tempControl(data.main.temp_min)}°${unitControl()}`;
    windspeedEl.textContent = `${data.wind.speed}mph`;
    rainEl.textContent = `${data.main.humidity}%`;
    sunriseEl.textContent = `${date.getTime(data.sys.sunrise * 1000)}`; // * 1000 to convert from unix timestamp
    sunsetEl.textContent = `${date.getTime(data.sys.sunset * 1000)}`;  // * 1000 to convert from unix timestamp
    setForecast(data);
  }
  
  // If server uses HTTPS:
  const setValuesForNavigator = function(data, setForecast) {
    const { current } = data;
    onSuccesfulLoad();
    currentLocationEl.innerHTML = "Current position".italics();
    currentWeatherEl.innerHTML = `${getIcon(current.weather[0].icon)}${tempControl(current.feels_like)}°${unitControl()}`;
    tempStateEl.textContent = `${current.weather[0].description.toUpperCase()}`;
    highestTempEl.innerHTML = "No data".italics();
    lowestTempEl.innerHTML = "No data".italics();
    windspeedEl.textContent = `${current.wind_speed}mph`;
    rainEl.textContent = `${current.humidity}`;
    sunriseEl.textContent = `${date.getTime(current.sunrise * 1000)}`; // * 1000 to convert from unix timestamp
    sunsetEl.textContent = `${date.getTime(current.sunset * 1000)}`; // * 1000 to convert from unix timestamp
    setForecast(data);
  }
  
  const setForecastValues = function(data) {
    forecastItems.forEach((item, index) => {
      let unixToDate = new Date(data.daily[index + 1].dt * 1000);
      item.children[0].textContent = date.getWeekDay(unixToDate);
      item.children[1].innerHTML = getIcon(data.daily[index + 1].weather[0].icon);
      item.children[2].textContent = `${kelvinToCelsius(data.daily[index + 1].temp.day)}°${unitControl()}`;
    })
  }

  // API call functions:

  // Current Weather Data API:
  const fetchWeather = function(loc = locationObj.getDefaultLocation()) {
    fetch(`${URL_WEATHER}${loc}`)
    .then(response => response.json())
    .then(data => setValues(data, fetchWeatherForecast))
    .catch(err => alert("Location not found, try again :)"))
    locationObj.resetLocation();
  }

  // Open Weather Map, One Call API:
  const fetchWeatherForecast = function(data) {

    const FORECAST_QUERY = `?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly,alerts&appid=${API_KEY_WEATHER}`
    fetch(`${URL_WEATHER_FORECAST}${FORECAST_QUERY}`)
    .then(response => response.json())
    .then(data => setForecastValues(data));
  }

  // Fetch One Call API using coords from Navigator.Geolocation API:
  // If the user declines the geolocation prompt, fetchWeather runs instead
  const fetchWeatherWithCoords = function() {
    navigator.geolocation.getCurrentPosition(function(position) {
      const { latitude, longitude } = position.coords;
      const FORECAST_QUERY = `?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${API_KEY_WEATHER}`;
      fetch(`${URL_WEATHER_FORECAST}${FORECAST_QUERY}`)
      .then(response => response.json())
      .then(data => setValuesForNavigator(data, setForecastValues))
    }, function() {
      initiateSpinner();
      fetchWeather();
    })
  }

  // Event listeners: 

  const fetchEvent = function(event) {
    if (event.key === "Enter") {
      initiateSpinner();
      fetchWeather(locationObj.getLocation());
    }
  }
  
  const setListeners = function() {
    buttonEl.addEventListener("click", function() {
      initiateSpinner();
      fetchWeather(locationObj.getLocation());
    })
    inputEl.addEventListener("keypress", fetchEvent);
    fbuttonEl.addEventListener("click", function() {
      fbuttonEl.classList.add("active");
      cbuttonEl.classList.remove("active");
    })
    cbuttonEl.addEventListener("click", function() {
      cbuttonEl.classList.add("active");
      fbuttonEl.classList.remove("active");
    })
  }

  // Onload init:

  const init = function() {
    setListeners();
    dateEl.textContent = date.displayDate();
    
    // If server uses HTTPS, use Navigator API to fetch coords and use coords to fetch all displayed data from One Call API (One Call API has no data for lowest and highest):
    location.protocol === "https:" ? fetchWeatherWithCoords() : fetchWeather();
  }

  return {
    init
  }
})();

export default App;