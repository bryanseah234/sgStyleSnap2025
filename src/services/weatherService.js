import { handleSupabaseError } from '@/lib/supabase'

export class WeatherService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
    this.baseUrl = 'https://api.openweathermap.org/data/2.5'
  }

  async getCurrentWeather(location = null) {
    try {
      if (!this.apiKey) {
        // Return mock weather data if API key not configured
        return {
          success: true,
          data: {
            temperature: 22,
            condition: 'sunny',
            humidity: 65,
            wind_speed: 10,
            location: location || 'New York, NY',
            description: 'Clear sky',
            icon: '01d'
          }
        }
      }

      // If no location provided, try to get user's location
      if (!location) {
        location = await this.getUserLocation()
      }

      const response = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        data: {
          temperature: Math.round(data.main.temp),
          condition: this.mapWeatherCondition(data.weather[0].main),
          humidity: data.main.humidity,
          wind_speed: data.wind.speed,
          location: `${data.name}, ${data.sys.country}`,
          description: data.weather[0].description,
          icon: data.weather[0].icon
        }
      }
    } catch (error) {
      console.error('Weather service error:', error)
      // Return fallback weather data
      return {
        success: true,
        data: {
          temperature: 20,
          condition: 'mild',
          humidity: 60,
          wind_speed: 8,
          location: location || 'Unknown',
          description: 'Weather data unavailable',
          icon: '02d'
        }
      }
    }
  }

  async getWeatherForecast(location = null, days = 5) {
    try {
      if (!this.apiKey) {
        // Return mock forecast data
        return {
          success: true,
          data: this.generateMockForecast(days)
        }
      }

      if (!location) {
        location = await this.getUserLocation()
      }

      const response = await fetch(
        `${this.baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric`
      )

      if (!response.ok) {
        throw new Error(`Weather forecast API error: ${response.statusText}`)
      }

      const data = await response.json()

      // Process forecast data to get daily forecasts
      const dailyForecasts = this.processForecastData(data.list, days)

      return {
        success: true,
        data: dailyForecasts
      }
    } catch (error) {
      console.error('Weather forecast error:', error)
      return {
        success: true,
        data: this.generateMockForecast(days)
      }
    }
  }

  async getUserLocation() {
    try {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'))
          return
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords
              const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}`
              )
              
              if (response.ok) {
                const data = await response.json()
                resolve(`${data[0].name}, ${data[0].country}`)
              } else {
                resolve('New York, NY') // Fallback
              }
            } catch (error) {
              resolve('New York, NY') // Fallback
            }
          },
          () => {
            resolve('New York, NY') // Fallback
          },
          { timeout: 5000 }
        )
      })
    } catch (error) {
      return 'New York, NY' // Fallback
    }
  }

  mapWeatherCondition(condition) {
    const conditionMap = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'stormy',
      'Snow': 'snowy',
      'Mist': 'foggy',
      'Fog': 'foggy',
      'Haze': 'foggy'
    }
    return conditionMap[condition] || 'mild'
  }

  processForecastData(forecastList, days) {
    const dailyData = {}
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString()
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          temperatures: [],
          conditions: [],
          humidity: [],
          wind_speed: []
        }
      }
      
      dailyData[date].temperatures.push(item.main.temp)
      dailyData[date].conditions.push(item.weather[0].main)
      dailyData[date].humidity.push(item.main.humidity)
      dailyData[date].wind_speed.push(item.wind.speed)
    })

    return Object.values(dailyData).slice(0, days).map(day => ({
      date: day.date,
      temperature: {
        min: Math.round(Math.min(...day.temperatures)),
        max: Math.round(Math.max(...day.temperatures)),
        avg: Math.round(day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length)
      },
      condition: this.mapWeatherCondition(day.conditions[0]),
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      wind_speed: Math.round(day.wind_speed.reduce((a, b) => a + b, 0) / day.wind_speed.length)
    }))
  }

  generateMockForecast(days) {
    const conditions = ['sunny', 'cloudy', 'rainy', 'mild']
    const forecast = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      forecast.push({
        date: date.toDateString(),
        temperature: {
          min: Math.round(15 + Math.random() * 10),
          max: Math.round(20 + Math.random() * 15),
          avg: Math.round(18 + Math.random() * 12)
        },
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: Math.round(50 + Math.random() * 30),
        wind_speed: Math.round(5 + Math.random() * 10)
      })
    }
    
    return forecast
  }

  getWeatherRecommendations(weather) {
    const recommendations = {
      clothing: [],
      accessories: [],
      notes: []
    }

    const { temperature, condition } = weather

    // Temperature-based recommendations
    if (temperature < 5) {
      recommendations.clothing.push('Heavy coat', 'Warm layers', 'Thermal underwear')
      recommendations.accessories.push('Gloves', 'Scarf', 'Warm hat')
      recommendations.notes.push('Very cold weather - dress warmly')
    } else if (temperature < 15) {
      recommendations.clothing.push('Jacket', 'Long sleeves', 'Pants')
      recommendations.accessories.push('Light scarf', 'Hat')
      recommendations.notes.push('Cool weather - layer up')
    } else if (temperature < 25) {
      recommendations.clothing.push('Light jacket', 'Long or short sleeves')
      recommendations.notes.push('Mild weather - comfortable layers')
    } else {
      recommendations.clothing.push('Light clothing', 'Shorts', 'T-shirts')
      recommendations.accessories.push('Sunglasses', 'Hat')
      recommendations.notes.push('Warm weather - stay cool')
    }

    // Condition-based recommendations
    if (condition === 'rainy') {
      recommendations.clothing.push('Waterproof jacket', 'Waterproof shoes')
      recommendations.accessories.push('Umbrella', 'Rain boots')
      recommendations.notes.push('Rain expected - stay dry')
    } else if (condition === 'sunny') {
      recommendations.accessories.push('Sunglasses', 'Sunscreen', 'Hat')
      recommendations.notes.push('Sunny weather - protect from UV')
    } else if (condition === 'windy') {
      recommendations.clothing.push('Windproof jacket')
      recommendations.notes.push('Windy conditions - secure loose items')
    }

    return recommendations
  }
}

export const weatherService = new WeatherService()
