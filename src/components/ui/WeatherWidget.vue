<!--
  Weather Widget Component - StyleSnap
  
  Purpose: Displays current weather with outfit suggestions
  
  Features:
  - Shows current temperature and conditions
  - Weather icon display
  - Outfit suggestion text
  - Location-based weather data
  - Error handling for weather API failures
  
  Usage:
  <WeatherWidget />
-->

<template>
  <div class="weather-widget">
    <!-- Loading State -->
    <div v-if="loading" class="weather-loading">
      <div class="weather-spinner"></div>
      <span>Loading weather...</span>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="weather-error">
      <svg class="weather-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <span>{{ error }}</span>
    </div>
    
    <!-- Weather Display -->
    <div v-else-if="weather" class="weather-content">
      <div class="weather-main">
        <div class="weather-icon-container">
          <img 
            v-if="weatherIconUrl" 
            :src="weatherIconUrl" 
            :alt="weather.description"
            class="weather-icon-image"
          >
          <svg 
            v-else
            class="weather-icon-fallback" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
          </svg>
        </div>
        
        <div class="weather-info">
          <div class="weather-temp">
            {{ formattedTemp }}
          </div>
          <div class="weather-condition">
            {{ formattedDescription }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- No Weather Data -->
    <div v-else class="weather-empty">
      <svg class="weather-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
      </svg>
      <span>Weather unavailable</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import { 
  getCurrentWeather, 
  getUserLocation, 
  getWeatherIconUrl, 
  formatTemperature, 
  formatWeatherDescription,
  getWeatherBasedRecommendations
} from '@/services/weather-service'

const authStore = useAuthStore()

// Reactive state
const weather = ref(null)
const loading = ref(false)
const error = ref(null)

// Computed properties
const weatherIconUrl = computed(() => {
  return weather.value?.icon ? getWeatherIconUrl(weather.value.icon) : null
})

const formattedTemp = computed(() => {
  return weather.value ? formatTemperature(weather.value.temp) : '--°C'
})

const formattedDescription = computed(() => {
  return weather.value ? formatWeatherDescription(weather.value.description) : 'Unknown'
})

const outfitSuggestion = computed(() => {
  if (!weather.value) return 'Weather data unavailable'
  
  const temp = weather.value.temp
  const condition = weather.value.condition
  
  // Generate outfit suggestion based on weather
  const recommendations = getWeatherBasedRecommendations(temp, condition)
  
  // Create friendly suggestion text
  if (temp < 4) {
    return 'Bundle up with warm layers'
  } else if (temp < 13) {
    return 'Perfect for cozy jackets and layers'
  } else if (temp < 18) {
    return 'Ideal for light jackets and comfortable outfits'
  } else if (temp < 24) {
    return 'Perfect for comfortable outfits'
  } else if (temp < 29) {
    return 'Great for light, breathable clothing'
  } else {
    return 'Perfect for lightweight, cool outfits'
  }
})

// Methods
async function fetchWeather() {
  loading.value = true
  error.value = null
  
  try {
    // Get user's location
    const location = await getUserLocation()
    
    // Get current weather
    const weatherData = await getCurrentWeather(location.lat, location.lon)
    
    weather.value = weatherData
  } catch (err) {
    console.error('Failed to fetch weather:', err)
    
    // Provide more specific error messages
    if (err.message.includes('timeout')) {
      error.value = 'Location request timed out'
    } else if (err.message.includes('denied')) {
      error.value = 'Location access denied'
    } else if (err.message.includes('not supported')) {
      error.value = 'Location not supported'
    } else {
      error.value = 'Unable to load weather data'
    }
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchWeather()
})
</script>

<style scoped>
.weather-widget {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.weather-widget:hover {
  background: var(--theme-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.weather-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.weather-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.weather-error,
.weather-empty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.weather-error {
  color: #ef4444;
}

.weather-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.weather-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.weather-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.weather-icon-image {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
}

.weather-icon-fallback {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--theme-primary);
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
}

.weather-temp {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme-text);
  line-height: 1.2;
}

.weather-condition {
  font-size: 0.75rem;
  color: var(--theme-text-secondary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .weather-loading,
  .weather-empty {
    color: #9ca3af;
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .weather-widget {
    padding: 0.375rem 0.5rem;
  }
  
  .weather-temp {
    font-size: 0.8125rem;
  }
  
  .weather-condition {
    font-size: 0.6875rem;
  }
}
</style>
