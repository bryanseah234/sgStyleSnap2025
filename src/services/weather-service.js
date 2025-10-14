/**
 * Weather Service for Outfit Suggestions
 * 
 * Integrates with OpenWeatherMap API to provide weather-aware outfit suggestions.
 * Helps users choose appropriate clothing based on temperature and conditions.
 * 
 * @module services/weather-service
 */

import { supabase } from '../config/supabase.js'

// OpenWeatherMap API configuration
const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5'

/**
 * Weather condition categories for outfit selection
 */
export const WEATHER_CONDITIONS = {
  CLEAR: 'clear',
  CLOUDS: 'clouds',
  RAIN: 'rain',
  SNOW: 'snow',
  THUNDERSTORM: 'thunderstorm',
  DRIZZLE: 'drizzle',
  MIST: 'mist'
}

/**
 * Temperature categories for outfit recommendations
 */
export const TEMP_CATEGORIES = {
  VERY_COLD: 'very_cold', // < 4°C
  COLD: 'cold', // 4-13°C
  COOL: 'cool', // 13-18°C
  MILD: 'mild', // 18-24°C
  WARM: 'warm', // 24-29°C
  HOT: 'hot' // > 29°C
}

/**
 * Get current weather for a location
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 * 
 * @example
 * const weather = await getCurrentWeather(40.7128, -74.0060);
 * console.log(weather.temp, weather.condition);
 */
export async function getCurrentWeather(lat, lon) {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    )

    if (!response.ok) {
      throw new Error('Weather API request failed')
    }

    const data = await response.json()

    return {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      condition: data.weather[0].main.toLowerCase(),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed),
      icon: data.weather[0].icon,
      location: data.name
    }
  } catch (error) {
    console.error('Error fetching weather:', error)
    throw new Error('Failed to fetch weather data')
  }
}

/**
 * Get weather forecast for next 5 days
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Forecast data
 */
export async function getWeatherForecast(lat, lon) {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    )

    if (!response.ok) {
      throw new Error('Weather API request failed')
    }

    const data = await response.json()

    // Group by day and get midday forecast
    const dailyForecasts = {}

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString()
      const hour = new Date(item.dt * 1000).getHours()

      // Use midday forecast (12 PM) as representative
      if (hour === 12 || !dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main.toLowerCase(),
          description: item.weather[0].description,
          icon: item.weather[0].icon
        }
      }
    })

    return Object.values(dailyForecasts).slice(0, 5)
  } catch (error) {
    console.error('Error fetching forecast:', error)
    throw new Error('Failed to fetch weather forecast')
  }
}

/**
 * Categorize temperature for outfit selection
 * 
 * @param {number} temp - Temperature in Celsius
 * @returns {string} Temperature category
 */
export function categorizeTemperature(temp) {
  if (temp < 4) return TEMP_CATEGORIES.VERY_COLD
  if (temp < 13) return TEMP_CATEGORIES.COLD
  if (temp < 18) return TEMP_CATEGORIES.COOL
  if (temp < 24) return TEMP_CATEGORIES.MILD
  if (temp < 29) return TEMP_CATEGORIES.WARM
  return TEMP_CATEGORIES.HOT
}

/**
 * Get outfit recommendations based on weather
 * 
 * @param {number} temp - Temperature in Celsius
 * @param {string} condition - Weather condition
 * @returns {Object} Outfit recommendations
 * 
 * @example
 * const recommendations = getWeatherBasedRecommendations(7, 'rain');
 * // Returns: { layers: 3, categories: ['outerwear', 'top', 'bottom'], waterproof: true }
 */
export function getWeatherBasedRecommendations(temp, condition) {
  const tempCategory = categorizeTemperature(temp)

  const recommendations = {
    layers: 1,
    categories: [],
    waterproof: false,
    notes: []
  }

  // Temperature-based recommendations
  switch (tempCategory) {
    case TEMP_CATEGORIES.VERY_COLD:
      recommendations.layers = 3
      recommendations.categories = ['outerwear', 'top', 'bottom']
      recommendations.notes.push('Heavy coat or jacket recommended')
      recommendations.notes.push('Consider warm accessories (scarf, gloves)')
      break

    case TEMP_CATEGORIES.COLD:
      recommendations.layers = 2
      recommendations.categories = ['outerwear', 'top', 'bottom']
      recommendations.notes.push('Light jacket or coat')
      break

    case TEMP_CATEGORIES.COOL:
      recommendations.layers = 2
      recommendations.categories = ['outerwear', 'top', 'bottom']
      recommendations.notes.push('Light jacket, cardigan, or sweater')
      break

    case TEMP_CATEGORIES.MILD:
      recommendations.layers = 1
      recommendations.categories = ['top', 'bottom']
      recommendations.notes.push('Comfortable weather, no layers needed')
      break

    case TEMP_CATEGORIES.WARM:
      recommendations.layers = 1
      recommendations.categories = ['top', 'bottom']
      recommendations.notes.push('Light, breathable fabrics')
      break

    case TEMP_CATEGORIES.HOT:
      recommendations.layers = 1
      recommendations.categories = ['top', 'bottom']
      recommendations.notes.push('Lightweight, breathable clothing')
      recommendations.notes.push('Light colors reflect heat')
      break
  }

  // Condition-based recommendations
  switch (condition) {
    case WEATHER_CONDITIONS.RAIN:
    case WEATHER_CONDITIONS.DRIZZLE:
      recommendations.waterproof = true
      recommendations.notes.push('Waterproof jacket or raincoat')
      recommendations.notes.push('Consider waterproof footwear')
      break

    case WEATHER_CONDITIONS.SNOW:
      recommendations.waterproof = true
      recommendations.notes.push('Waterproof winter coat')
      recommendations.notes.push('Insulated boots recommended')
      break

    case WEATHER_CONDITIONS.THUNDERSTORM:
      recommendations.waterproof = true
      recommendations.notes.push('Heavy rain gear recommended')
      break

    case WEATHER_CONDITIONS.CLEAR:
      if (temp > 24) {
        recommendations.notes.push('Sun protection recommended')
      }
      break
  }

  return recommendations
}

/**
 * Filter clothing items based on weather conditions
 * 
 * @param {Array} items - Clothing items to filter
 * @param {number} temp - Temperature in Celsius
 * @param {string} condition - Weather condition
 * @returns {Array} Filtered items suitable for weather
 * 
 * @example
 * const suitableItems = filterItemsByWeather(allItems, 7, 'rain');
 */
export function filterItemsByWeather(items, temp, condition) {
  const recommendations = getWeatherBasedRecommendations(temp, condition)
  const tempCategory = categorizeTemperature(temp)

  return items.filter(item => {
    // Filter by category based on weather needs
    if (!recommendations.categories.includes(item.category)) {
      // Allow shoes and accessories always
      if (item.category !== 'shoes' && item.category !== 'accessory') {
        return false
      }
    }

    // Filter by style tags if available
    if (item.style_tags && Array.isArray(item.style_tags)) {
      // Temperature filtering
      if (tempCategory === TEMP_CATEGORIES.VERY_COLD || tempCategory === TEMP_CATEGORIES.COLD) {
        // Prefer warm items in cold weather
        if (item.style_tags.includes('summer') || item.style_tags.includes('shorts')) {
          return false
        }
      }

      if (tempCategory === TEMP_CATEGORIES.HOT || tempCategory === TEMP_CATEGORIES.WARM) {
        // Prefer light items in hot weather
        if (item.style_tags.includes('winter') || item.style_tags.includes('heavy')) {
          return false
        }
      }

      // Condition filtering
      if (recommendations.waterproof) {
        // In rainy conditions, prefer waterproof items for outerwear
        if (
          item.category === 'outerwear' &&
          !item.style_tags.includes('waterproof') &&
          !item.style_tags.includes('rain')
        ) {
          // Don't completely exclude, just deprioritize
          item.weatherScore = 0.5
        } else if (item.style_tags.includes('waterproof') || item.style_tags.includes('rain')) {
          item.weatherScore = 1.5 // Boost waterproof items
        }
      }
    }

    return true
  })
}

/**
 * Generate weather-aware outfit suggestion
 * 
 * @param {string} userId - User ID
 * @param {number} temp - Temperature in Celsius
 * @param {string} condition - Weather condition
 * @returns {Promise<Object>} Outfit suggestion
 * 
 * @example
 * const suggestion = await generateWeatherAwareOutfit(userId, 20, 'clear');
 */
export async function generateWeatherAwareOutfit(userId, temp, condition) {
  try {
    // Get user's clothing items
    const { data: items, error } = await supabase
      .from('clothes')
      .select('*')
      .eq('owner_id', userId)
      .is('removed_at', null)
      .eq('privacy', 'friends') // Only suggest from shareable items

    if (error) throw error

    if (!items || items.length === 0) {
      throw new Error('No clothing items found')
    }

    // Filter items based on weather
    const suitableItems = filterItemsByWeather(items, temp, condition)

    if (suitableItems.length === 0) {
      throw new Error('No suitable items found for current weather')
    }

    // Get recommendations
    const recommendations = getWeatherBasedRecommendations(temp, condition)

    // Build outfit based on required categories
    const outfit = {}

    for (const category of recommendations.categories) {
      const categoryItems = suitableItems.filter(item => item.category === category)
      if (categoryItems.length > 0) {
        // Prioritize items with higher weatherScore
        categoryItems.sort((a, b) => (b.weatherScore || 1) - (a.weatherScore || 1))
        outfit[category] =
          categoryItems[Math.floor(Math.random() * Math.min(3, categoryItems.length))]
      }
    }

    // Add shoes if available
    const shoes = suitableItems.filter(item => item.category === 'shoes')
    if (shoes.length > 0) {
      outfit.shoes = shoes[Math.floor(Math.random() * shoes.length)]
    }

    return {
      outfit,
      weather: {
        temp,
        condition,
        tempCategory: categorizeTemperature(temp)
      },
      recommendations: recommendations.notes,
      created_at: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error generating weather-aware outfit:', error)
    throw error
  }
}

/**
 * Get user's location from browser geolocation API
 * 
 * @returns {Promise<Object>} Coordinates {lat, lon}
 */
export async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      error => {
        reject(new Error('Failed to get location: ' + error.message))
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    )
  })
}

/**
 * Get weather-aware suggestions with user's location
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Suggestion with weather data
 * 
 * @example
 * const suggestion = await getWeatherAwareSuggestion(userId);
 */
export async function getWeatherAwareSuggestion(userId) {
  try {
    // Get user's location
    const location = await getUserLocation()

    // Get current weather
    const weather = await getCurrentWeather(location.lat, location.lon)

    // Generate outfit based on weather
    const suggestion = await generateWeatherAwareOutfit(userId, weather.temp, weather.condition)

    return {
      ...suggestion,
      weather: {
        ...weather,
        ...suggestion.weather
      }
    }
  } catch (error) {
    console.error('Error getting weather-aware suggestion:', error)
    throw error
  }
}

/**
 * Save weather data with outfit history
 * 
 * @param {string} outfitHistoryId - Outfit history record ID
 * @param {number} temp - Temperature
 * @param {string} condition - Weather condition
 */
export async function saveWeatherWithOutfit(outfitHistoryId, temp, condition) {
  try {
    const { error } = await supabase
      .from('outfit_history')
      .update({
        weather_temp: temp,
        weather_condition: condition
      })
      .eq('id', outfitHistoryId)

    if (error) throw error
  } catch (error) {
    console.error('Error saving weather data:', error)
    throw error
  }
}

/**
 * Get weather icon URL from OpenWeatherMap
 * 
 * @param {string} iconCode - Weather icon code from API
 * @returns {string} Icon URL
 */
export function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

/**
 * Format temperature display with unit
 * 
 * @param {number} temp - Temperature in Celsius
 * @param {boolean} showUnit - Whether to show °C unit
 * @returns {string} Formatted temperature
 */
export function formatTemperature(temp, showUnit = true) {
  return `${temp}${showUnit ? '°C' : ''}`
}

/**
 * Get weather description with proper capitalization
 * 
 * @param {string} description - Weather description from API
 * @returns {string} Formatted description
 */
export function formatWeatherDescription(description) {
  return description
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Check if weather conditions require special clothing
 * 
 * @param {string} condition - Weather condition
 * @returns {Object} Special requirements
 */
export function getSpecialRequirements(condition) {
  const requirements = {
    needsWaterproof: false,
    needsInsulation: false,
    needsSunProtection: false,
    needsWindProtection: false
  }

  switch (condition) {
    case WEATHER_CONDITIONS.RAIN:
    case WEATHER_CONDITIONS.DRIZZLE:
    case WEATHER_CONDITIONS.THUNDERSTORM:
      requirements.needsWaterproof = true
      break

    case WEATHER_CONDITIONS.SNOW:
      requirements.needsWaterproof = true
      requirements.needsInsulation = true
      break

    case WEATHER_CONDITIONS.CLEAR:
      requirements.needsSunProtection = true
      break

    case WEATHER_CONDITIONS.CLOUDS:
      requirements.needsWindProtection = true
      break
  }

  return requirements
}