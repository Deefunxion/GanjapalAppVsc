// Weather Integration Service for Athens, Greece
export class WeatherService {
  constructor() {
    this.apiKey = null; // Set this to your OpenWeatherMap API key
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.city = 'Athens,GR';
    this.lastFetch = null;
    this.cachedData = null;
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  // Set API key for weather service
  setApiKey(key) {
    this.apiKey = key;
  }

  // Check if cached data is still valid
  isCacheValid() {
    return this.cachedData && 
           this.lastFetch && 
           (Date.now() - this.lastFetch) < this.cacheTimeout;
  }

  // Fetch current weather data
  async getCurrentWeather() {
    if (this.isCacheValid()) {
      return this.cachedData;
    }

    try {
      if (!this.apiKey) {
        return this.getMockCurrentWeather();
      }

      const response = await fetch(
        `${this.baseUrl}/weather?q=${this.city}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      this.cachedData = this.processCurrentWeather(data);
      this.lastFetch = Date.now();
      
      return this.cachedData;
    } catch (error) {
      console.warn('Weather API unavailable, using mock data:', error);
      return this.getMockCurrentWeather();
    }
  }

  // Fetch 5-day forecast
  async getForecast() {
    try {
      if (!this.apiKey) {
        return this.getMockForecast();
      }

      const response = await fetch(
        `${this.baseUrl}/forecast?q=${this.city}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      return this.processForecast(data);
    } catch (error) {
      console.warn('Forecast API unavailable, using mock data:', error);
      return this.getMockForecast();
    }
  }

  // Process current weather data
  processCurrentWeather(data) {
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      visibility: data.visibility / 1000, // Convert to km
      cloudiness: data.clouds.all,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      timestamp: new Date(data.dt * 1000)
    };
  }

  // Process forecast data
  processForecast(data) {
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: new Date(item.dt * 1000),
          temps: [],
          humidity: [],
          conditions: [],
          windSpeed: [],
          precipitation: 0
        };
      }
      
      dailyForecasts[date].temps.push(item.main.temp);
      dailyForecasts[date].humidity.push(item.main.humidity);
      dailyForecasts[date].conditions.push(item.weather[0].main);
      dailyForecasts[date].windSpeed.push(item.wind.speed);
      
      if (item.rain && item.rain['3h']) {
        dailyForecasts[date].precipitation += item.rain['3h'];
      }
    });

    return Object.values(dailyForecasts).map(day => ({
      date: day.date,
      tempMin: Math.round(Math.min(...day.temps)),
      tempMax: Math.round(Math.max(...day.temps)),
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      avgWindSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length * 10) / 10,
      precipitation: Math.round(day.precipitation * 10) / 10,
      dominantCondition: this.getMostFrequent(day.conditions)
    })).slice(0, 5);
  }

  // Get most frequent condition
  getMostFrequent(arr) {
    const frequency = {};
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }

  // Mock current weather for demo/fallback
  getMockCurrentWeather() {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour <= 20;
    
    // Simulate realistic Athens weather patterns
    const baseTemp = isDay ? 28 : 22;
    const tempVariation = (Math.random() - 0.5) * 8;
    
    this.cachedData = {
      temperature: Math.round(baseTemp + tempVariation),
      feelsLike: Math.round(baseTemp + tempVariation + 3),
      humidity: Math.round(40 + Math.random() * 30),
      pressure: Math.round(1010 + Math.random() * 20),
      windSpeed: Math.round(Math.random() * 15 * 10) / 10,
      windDirection: Math.round(Math.random() * 360),
      visibility: 10,
      cloudiness: Math.round(Math.random() * 100),
      condition: Math.random() > 0.7 ? 'Clouds' : 'Clear',
      description: Math.random() > 0.7 ? 'scattered clouds' : 'clear sky',
      icon: isDay ? '01d' : '01n',
      sunrise: new Date(new Date().setHours(6, 30, 0, 0)),
      sunset: new Date(new Date().setHours(19, 45, 0, 0)),
      timestamp: new Date()
    };
    
    this.lastFetch = Date.now();
    return this.cachedData;
  }

  // Mock forecast for demo/fallback
  getMockForecast() {
    const forecast = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const baseTemp = 25 + Math.random() * 10;
      
      forecast.push({
        date,
        tempMin: Math.round(baseTemp - 5),
        tempMax: Math.round(baseTemp + 5),
        avgHumidity: Math.round(40 + Math.random() * 30),
        avgWindSpeed: Math.round(Math.random() * 10 * 10) / 10,
        precipitation: Math.random() > 0.8 ? Math.round(Math.random() * 5 * 10) / 10 : 0,
        dominantCondition: Math.random() > 0.6 ? 'Clear' : 'Clouds'
      });
    }
    
    return forecast;
  }

  // Analyze weather for growing alerts
  analyzeGrowingConditions(currentWeather, forecast) {
    const alerts = [];
    
    // Current temperature alerts
    if (currentWeather.temperature > 35) {
      alerts.push({
        type: 'heat_extreme',
        severity: 'critical',
        title: 'Extreme Heat Warning',
        message: `Temperature at ${currentWeather.temperature}°C - immediate plant protection required`,
        recommendations: [
          'Install shade cloth (50-70%)',
          'Increase watering frequency',
          'Ensure adequate ventilation',
          'Move containers to shaded areas'
        ]
      });
    } else if (currentWeather.temperature > 30) {
      alerts.push({
        type: 'heat_stress',
        severity: 'warning',
        title: 'Heat Stress Risk',
        message: `Temperature at ${currentWeather.temperature}°C - monitor plants closely`,
        recommendations: [
          'Consider afternoon shade',
          'Monitor soil moisture',
          'Watch for wilting signs'
        ]
      });
    }

    // Humidity alerts
    if (currentWeather.humidity > 75) {
      alerts.push({
        type: 'humidity_high',
        severity: 'warning',
        title: 'High Humidity Alert',
        message: `Humidity at ${currentWeather.humidity}% - mold/mildew risk increased`,
        recommendations: [
          'Improve air circulation',
          'Reduce watering frequency',
          'Monitor for fungal issues'
        ]
      });
    } else if (currentWeather.humidity < 25) {
      alerts.push({
        type: 'humidity_low',
        severity: 'info',
        title: 'Low Humidity Notice',
        message: `Humidity at ${currentWeather.humidity}% - plants may need more water`,
        recommendations: [
          'Increase watering frequency',
          'Consider humidity domes for seedlings'
        ]
      });
    }

    // Wind alerts
    if (currentWeather.windSpeed > 25) {
      alerts.push({
        type: 'wind_strong',
        severity: 'warning',
        title: 'Strong Wind Warning',
        message: `Wind speed at ${currentWeather.windSpeed} km/h - secure plants`,
        recommendations: [
          'Stake tall plants',
          'Move containers to sheltered areas',
          'Check for branch damage'
        ]
      });
    }

    // Forecast-based alerts
    if (forecast && forecast.length > 0) {
      const nextDayTemp = forecast[0].tempMax;
      if (nextDayTemp > 35) {
        alerts.push({
          type: 'heat_forecast',
          severity: 'warning',
          title: 'Heat Wave Approaching',
          message: `Tomorrow's high: ${nextDayTemp}°C - prepare heat protection`,
          recommendations: [
            'Set up shade cloth today',
            'Prepare extra water supply',
            'Plan for increased monitoring'
          ]
        });
      }

      // Check for precipitation
      const rainDays = forecast.filter(day => day.precipitation > 0).length;
      if (rainDays >= 3) {
        alerts.push({
          type: 'rain_extended',
          severity: 'info',
          title: 'Extended Wet Period',
          message: `Rain expected for ${rainDays} days - adjust watering schedule`,
          recommendations: [
            'Reduce watering frequency',
            'Improve drainage',
            'Monitor for overwatering signs'
          ]
        });
      }
    }

    return alerts;
  }

  // Get growing recommendations based on current conditions
  getGrowingRecommendations(currentWeather) {
    const recommendations = [];
    
    // Watering recommendations
    if (currentWeather.temperature > 30 && currentWeather.humidity < 50) {
      recommendations.push({
        category: 'watering',
        priority: 'high',
        action: 'Increase watering frequency',
        reason: 'High temperature and low humidity increase water needs'
      });
    }

    // Training recommendations
    if (currentWeather.temperature < 25 && currentWeather.windSpeed < 10) {
      recommendations.push({
        category: 'training',
        priority: 'medium',
        action: 'Good conditions for plant training',
        reason: 'Mild temperature and low wind reduce stress during training'
      });
    }

    // Feeding recommendations
    if (currentWeather.condition === 'Clear' && currentWeather.temperature < 28) {
      recommendations.push({
        category: 'feeding',
        priority: 'medium',
        action: 'Optimal feeding conditions',
        reason: 'Clear weather and moderate temperature enhance nutrient uptake'
      });
    }

    return recommendations;
  }
}

// Export singleton instance
export const weatherService = new WeatherService();

