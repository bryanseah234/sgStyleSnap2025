// StyleSnap API Client - Real Supabase Integration
import { authService } from '@/services/authService'
import { clothesService } from '@/services/clothesService'
import { friendsService } from '@/services/friendsService'
import { outfitsService } from '@/services/outfitsService'
import { notificationsService } from '@/services/notificationsService'
import { catalogService } from '@/services/catalogService'
import { analyticsService } from '@/services/analyticsService'
import { weatherService } from '@/services/weatherService'
import { cloudinary } from '@/lib/cloudinary'

class StyleSnapAPI {
  constructor() {
    this.auth = authService
    this.entities = {
      ClothingItem: clothesService,
      Outfit: outfitsService,
      Friendship: friendsService
    }
    this.integrations = {
      Core: {
        UploadFile: async ({ file }) => {
          const result = await cloudinary.uploadImage(file, {
            folder: 'stylesnap/uploads',
            quality: 80,
            format: 'auto'
          })
          return { file_url: result.secure_url }
        }
      }
    }
    this.notifications = notificationsService
    this.friends = friendsService
    this.outfits = outfitsService
    this.clothes = clothesService
    this.catalog = catalogService
    this.analytics = analyticsService
    this.weather = weatherService
  }
}

// Export the API client
export const api = new StyleSnapAPI()