let latitude;
let longitude;
let data;
let city;
let SearchBar = document.querySelector('#input-city')
let key = `ee595b13872be49fe89468a273644d23`;

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                    resolve(); // Resolve the promise when location is obtained
                },
                function (error) {
                    document.getElementById("location-error").textContent = "Error getting location: " + error.message;
                    reject(error); // Reject the promise in case of an error
                }
            );
        } else {
            document.getElementById("location-error").textContent = "Geolocation is not supported";
            reject("Geolocation is not supported"); // Reject the promise when geolocation is not supported
        }
    });
}

async function fetchWeatherData(link) {
    const url = link;
    try {
        const response = await fetch(url);
        const responseData = await response.json();
        data = responseData;
        await writedata();
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

(async function () {
    try {
        await getUserLocation(); // Wait for location data to be obtained

        await fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`); // Wait for weather data to be fetched

        document.querySelector('#iframe-src').src = `https://www.google.com/maps?q=${encodeURIComponent(data.name)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
        // Rest of your code that processes the data and updates the UI
    } catch (error) {
        // Handle errors here
        console.error("An error occurred:", error);
    }
})();

setInterval(() => {
    const today = new Date();
    const time = {
        hour: today.getHours(),
        minute: today.getMinutes(),
        second: today.getSeconds()
    };
    const amPm = time.hour >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    time.hour = time.hour % 12 || 12;

    document.querySelector('#time').textContent = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:${String(time.second).padStart(2, '0')} ${amPm}`;
    document.querySelector('#time-at-wind').textContent = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')} ${amPm}`;
}, 500);

addEventListener('keypress', (event) => {
    if (SearchBar.classList.contains('show')) {
        if (event.key === 'Enter') {
            city = document.querySelector('#input-city').value
            document.querySelector('#iframe-src').src = `https://www.google.com/maps?q=${encodeURIComponent(city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

            fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=ee595b13872be49fe89468a273644d23&units=metric`); // Wait for weather data to be fetched
        }
    }
})

document.querySelector('#search-btn').addEventListener('click', () => {
    if (SearchBar.classList.contains('show')) {
        SearchBar.classList.add('hide')
        SearchBar.classList.remove('show')
    } else {
        SearchBar.classList.add('show')
        SearchBar.classList.remove('hide')
    }
})


async function writedata() {

    let temp = data.main.temp<50?data.main.temp:data.main.temp-273.15;
    document.querySelector('#temprature').textContent = parseInt(temp);
    document.querySelector('#description').textContent = data.weather[0].description;
    document.querySelector('#location').textContent = data.name;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    document.getElementById('date').textContent = formattedDate;

    document.querySelector('#wind-speed').textContent = data.wind.speed;

    const sysData = {
        "country": data.sys.country,
        "sunrise": data.sys.sunrise,
        "sunset": data.sys.sunset
    };

    function convertUnixTimestampToTime(unixTimestamp) {
        const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const amPm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Adjust hours to 12-hour format
        const time = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
        return { time, amPm }; // Return both time and AM/PM
    }

    let sunrisetime = convertUnixTimestampToTime(sysData.sunrise);
    let sunsettime = convertUnixTimestampToTime(sysData.sunset);

    // Set AM/PM for sunrise and sunset
    document.querySelector('#ampm-sunrise').textContent = sunrisetime.amPm;
    document.querySelector('#ampm-sunset').textContent = sunsettime.amPm;

    // Convert sunrise and sunset timestamps
    document.querySelector('#sunrise-time').textContent = sunrisetime.time;
    document.querySelector('#sunset-time').textContent = sunsettime.time;

    document.querySelector('#humidity-percentage').textContent = data.main.humidity;

    document.querySelector('#visibility-km').textContent = data.visibility / 1000

    document.querySelector('#feels-temprature').textContent = parseInt(data.main.feels_like<50?data.main.feels_like:data.main.feels_like-273.15);

    document.querySelector('#country-flag').src=`https://flagcdn.com/144x108/${data.sys.country.toLowerCase()}.png`;

    document.querySelector('#cloud-img').src=`http://openweathermap.org/img/w/${data.weather[0].icon}.png`
}
