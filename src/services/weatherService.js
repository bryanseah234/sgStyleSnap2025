import { supabase, handleSupabaseError } from '@/lib/supabase'

export class WeatherService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
    this.baseUrl = 'https://api.openweathermap.org/data/2.5'
  }

  async getCurrentWeather(location) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenWeather API key not configured')
      }

      const response = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        location: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        condition: data.weather[0].main.toLowerCase(),
        wind_speed: data.wind.speed,
        visibility: data.visibility / 1000, // Convert to km
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Weather API error:', error)
      throw new Error('Failed to fetch weather data')
    }
  }

  async getWeatherForecast(location, days = 5) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenWeather API key not configured')
      }

      const response = await fetch(
        `${this.baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric&cnt=${days * 8}` // 8 forecasts per day
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Group forecasts by day
      const dailyForecasts = {}
      
      data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toISOString().split('T')[0]
        
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = {
            date,
            temperatures: [],
            conditions: [],
            humidity: [],
            wind_speed: []
          }
        }
        
        dailyForecasts[date].temperatures.push(forecast.main.temp)
        dailyForecasts[date].conditions.push(forecast.weather[0].main.toLowerCase())
        dailyForecasts[date].humidity.push(forecast.main.humidity)
        dailyForecasts[date].wind_speed.push(forecast.wind.speed)
      })

      // Process daily data
      const processedForecasts = Object.values(dailyForecasts).map(day => {
        const avgTemp = Math.round(day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length)
        const minTemp = Math.round(Math.min(...day.temperatures))
        const maxTemp = Math.round(Math.max(...day.temperatures))
        
        // Get most common condition
        const conditionCount = {}
        day.conditions.forEach(condition => {
          conditionCount[condition] = (conditionCount[condition] || 0) + 1
        })
        const dominantCondition = Object.entries(conditionCount)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'clear'
        
        const avgHumidity = Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length)
        const avgWindSpeed = Math.round(day.wind_speed.reduce((a, b) => a + b, 0) / day.wind_speed.length)

        return {
          date: day.date,
          temperature: avgTemp,
          min_temperature: minTemp,
          max_temperature: maxTemp,
          condition: dominantCondition,
          humidity: avgHumidity,
          wind_speed: avgWindSpeed
        }
      })

      return {
        location: data.city.name,
        country: data.city.country,
        forecasts: processedForecasts.slice(0, days)
      }
    } catch (error) {
      console.error('Weather forecast API error:', error)
      throw new Error('Failed to fetch weather forecast')
    }
  }

  async getWeatherBasedSuggestions(weatherData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { temperature, condition } = weatherData
      
      // Get user's clothing items
      const { data: items, error: itemsError } = await supabase
        .from('clothes')
        .select('*')
        .eq('owner_id', user.id)
        .is('removed_at', null)

      if (itemsError) throw itemsError

      // Filter items based on weather
      const suitableItems = this.filterItemsByWeather(items, { temperature, condition })
      
      // Generate outfit suggestions
      const suggestions = this.generateWeatherBasedOutfits(suitableItems, { temperature, condition })
      
      return {
        weather_data: weatherData,
        suggestions,
        suitable_items: suitableItems
      }
    } catch (error) {
      handleSupabaseError(error, 'get weather based suggestions')
    }
  }

  filterItemsByWeather(items, weather) {
    const { temperature, condition } = weather
    
    return items.filter(item => {
      // Temperature-based filtering
      if (temperature < 5) {
        // Very cold - prefer warm items
        return ['outerwear', 'tops', 'bottoms', 'shoes'].includes(item.category) &&
               !item.style_tags?.includes('summer')
      } else if (temperature < 15) {
        // Cool - avoid very light items
        return !item.style_tags?.includes('summer') || item.category === 'outerwear'
      } else if (temperature > 25) {
        // Hot - prefer light items
        return !item.style_tags?.includes('winter') || item.category === 'accessories'
      } else {
        // Moderate temperature - most items suitable
        return true
      }
    }).filter(item => {
      // Weather condition filtering
      if (condition === 'rain') {
        // Rainy - prefer water-resistant items
        return item.style_tags?.includes('waterproof') || 
               item.category === 'outerwear' ||
               item.category === 'shoes'
      } else if (condition === 'snow') {
        // Snowy - prefer warm, water-resistant items
        return item.style_tags?.includes('winter') ||
               item.style_tags?.includes('waterproof') ||
               item.category === 'outerwear'
      } else if (condition === 'clear' || condition === 'clouds') {
        // Clear/cloudy - most items suitable
        return true
      }
      
      return true
    })
  }

  generateWeatherBasedOutfits(suitableItems, weather) {
    const { temperature, condition } = weather
    const outfits = []
    
    // Group items by category
    const itemsByCategory = {
      tops: suitableItems.filter(item => item.category === 'tops'),
      bottoms: suitableItems.filter(item => item.category === 'bottoms'),
      shoes: suitableItems.filter(item => item.category === 'shoes'),
      outerwear: suitableItems.filter(item => item.category === 'outerwear'),
      accessories: suitableItems.filter(item => item.category === 'accessories')
    }

    // Generate 3 different outfit suggestions
    for (let i = 0; i < 3; i++) {
      const outfit = []
      
      // Add top
      if (itemsByCategory.tops.length > 0) {
        outfit.push(itemsByCategory.tops[i % itemsByCategory.tops.length])
      }
      
      // Add bottom
      if (itemsByCategory.bottoms.length > 0) {
        outfit.push(itemsByCategory.bottoms[i % itemsByCategory.bottoms.length])
      }
      
      // Add shoes
      if (itemsByCategory.shoes.length > 0) {
        outfit.push(itemsByCategory.shoes[i % itemsByCategory.shoes.length])
      }
      
      // Add outerwear if cold or rainy
      if ((temperature < 15 || condition === 'rain') && itemsByCategory.outerwear.length > 0) {
        outfit.push(itemsByCategory.outerwear[i % itemsByCategory.outerwear.length])
      }
      
      // Add accessories for very cold weather
      if (temperature < 5 && itemsByCategory.accessories.length > 0) {
        outfit.push(itemsByCategory.accessories[i % itemsByCategory.accessories.length])
      }
      
      if (outfit.length >= 3) { // At least top, bottom, shoes
        outfits.push({
          name: this.getOutfitName(weather, i + 1),
          items: outfit,
          weather_rating: this.calculateWeatherRating(outfit, weather),
          description: this.getOutfitDescription(outfit, weather)
        })
      }
    }
    
    return outfits
  }

  getOutfitName(weather, index) {
    const { temperature, condition } = weather
    const names = []
    
    if (temperature < 5) {
      names.push('Cozy Winter Look', 'Warm & Toasty', 'Arctic Ready')
    } else if (temperature < 15) {
      names.push('Cool Weather Style', 'Autumn Vibes', 'Layered Look')
    } else if (temperature > 25) {
      names.push('Summer Breeze', 'Hot Day Chic', 'Cool & Comfortable')
    } else {
      names.push('Perfect Weather', 'Balanced Look', 'Comfortable Style')
    }
    
    if (condition === 'rain') {
      names.push('Rainy Day Ready', 'Storm Proof', 'Water Resistant')
    } else if (condition === 'snow') {
      names.push('Snow Day Style', 'Winter Wonder', 'Frosty Fashion')
    }
    
    return names[index % names.length] || `Weather Outfit ${index}`
  }

  calculateWeatherRating(outfit, weather) {
    const { temperature, condition } = weather
    let rating = 0
    
    outfit.forEach(item => {
      // Temperature appropriateness
      if (temperature < 5 && item.style_tags?.includes('winter')) rating += 2
      else if (temperature > 25 && item.style_tags?.includes('summer')) rating += 2
      else if (temperature >= 5 && temperature <= 25) rating += 1
      
      // Weather condition appropriateness
      if (condition === 'rain' && item.style_tags?.includes('waterproof')) rating += 2
      else if (condition === 'snow' && item.style_tags?.includes('winter')) rating += 2
      else if (condition === 'clear' || condition === 'clouds') rating += 1
    })
    
    return Math.min(10, Math.max(1, rating))
  }

  getOutfitDescription(outfit, weather) {
    const { temperature, condition } = weather
    const descriptions = []
    
    if (temperature < 5) {
      descriptions.push('Perfect for cold weather with warm layers')
    } else if (temperature < 15) {
      descriptions.push('Great for cool weather - comfortable and stylish')
    } else if (temperature > 25) {
      descriptions.push('Ideal for hot weather - light and breathable')
    } else {
      descriptions.push('Perfect for moderate weather conditions')
    }
    
    if (condition === 'rain') {
      descriptions.push('Includes water-resistant pieces for rainy weather')
    } else if (condition === 'snow') {
      descriptions.push('Warm and protective for snowy conditions')
    }
    
    return descriptions.join('. ')
  }

  // Helper method to get weather emoji
  getWeatherEmoji(condition) {
    const emojiMap = {
      'clear': '☀️',
      'clouds': '☁️',
      'rain': '🌧️',
      'snow': '❄️',
      'thunderstorm': '⛈️',
      'drizzle': '🌦️',
      'mist': '🌫️',
      'fog': '🌫️'
    }
    
    return emojiMap[condition] || '🌤️'
  }

  // Helper method to get temperature description
  getTemperatureDescription(temperature) {
    if (temperature < 0) return 'Freezing'
    if (temperature < 10) return 'Very Cold'
    if (temperature < 20) return 'Cool'
    if (temperature < 30) return 'Warm'
    return 'Hot'
  }
}

export const weatherService = new WeatherService()