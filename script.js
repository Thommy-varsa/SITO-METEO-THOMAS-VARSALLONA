const API_KEY = "INSERISCI_TUA_API_KEY";
const API_URL = "https://api.open-meteo.com/v1/forecast";
let chartInstance = null; // Per evitare creazione di più grafici

async function getWeather() {
    const city = document.getElementById("cityInput").value;
    if (!city) return alert("Inserisci una città!");

    const locationData = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=it&format=json`)
        .then(res => res.json());

    if (!locationData.results) return alert("Città non trovata!");

    const { latitude, longitude } = locationData.results[0];

    const weatherData = await fetch(`${API_URL}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weathercode&timezone=auto`)
        .then(res => res.json());

    displayWeather(weatherData);
}

function displayWeather(data) {
    const weatherContainer = document.getElementById("weatherContainer");
    weatherContainer.innerHTML = ""; // Pulisce il contenuto

    data.daily.time.forEach((day, index) => {
        const maxTemp = data.daily.temperature_2m_max[index];
        const minTemp = data.daily.temperature_2m_min[index];
        const hourlyTemps = data.hourly.temperature_2m.slice(index * 24, (index + 1) * 24);
        const hourlyLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

        let weatherIcon = "🤷‍♂️";
        let backgroundColor = "linear-gradient(to bottom, #ffb347, #ffcc33)";
        
        const weatherCode = data.hourly.weathercode[index * 24]; 
        if (weatherCode === 0) {
            weatherIcon = "☀️";
            backgroundColor = "linear-gradient(to bottom, #87cefa, #ffe082)";
        } else if (weatherCode >= 1 && weatherCode <= 3) {
            weatherIcon = "☁️";
            backgroundColor = "linear-gradient(to bottom, #d3d3d3, #a9a9a9)";
        } else if (weatherCode >= 51 && weatherCode <= 67) {
            weatherIcon = "🌧️";
            backgroundColor = "linear-gradient(to bottom, #5f9ea0, #4682b4)";
        } else if (weatherCode >= 95 && weatherCode <= 99) {
            weatherIcon = "⛈️";
            backgroundColor = "linear-gradient(to bottom, #4b0082, #000080)";
        } else if (weatherCode >= 71 && weatherCode <= 86) {
            weatherIcon = "❄️";
            backgroundColor = "linear-gradient(to bottom, #66a6ff, #add8e6)";
        } else if (weatherCode === 45 || weatherCode === 48) {
            weatherIcon = "🌫️";
            backgroundColor = "linear-gradient(to bottom, #dcdcdc, #b0c4de)";
        }

        // Crea la card meteo
        const card = document.createElement("div");
        card.className = "weather-card";
        card.style.background = backgroundColor;
        card.onclick = function() {
            showChart(hourlyLabels, hourlyTemps);
        };

        card.innerHTML = `
            <h4>${new Date(day).toLocaleDateString("it-IT", { weekday: "long", day: "2-digit", month: "long" })}</h4>
            <div class="icon">${weatherIcon}</div>
            <p>🌡️ Max: ${maxTemp}°C | Min: ${minTemp}°C</p>
            <p><small>TEMPERATURE ORARIE</small></p>
        `;

        weatherContainer.appendChild(card);
    });
}

// Funzione per mostrare il grafico con Chart.js
function showChart(labels, data) {
    const ctx = document.getElementById("weatherChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperatura (°C)",
                data: data,
                borderColor: "red",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: "Orario" } },
                y: { title: { display: true, text: "Temperatura (°C)" } }
            }
        }
    });
}
