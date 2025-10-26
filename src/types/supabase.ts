/**
 * StyleSnap - Supabase Type Definitions
 * 
 * Type definitions for Supabase database tables and relationships.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          theme: 'light' | 'dark' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          theme?: 'light' | 'dark' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          theme?: 'light' | 'dark' | null
          created_at?: string
          updated_at?: string
        }
      }
      clothing_items: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          subcategory: string | null
          brand: string | null
          color: string
          colors: string[] | null
          size: string | null
          image_url: string
          cloudinary_public_id: string | null
          notes: string | null
          tags: string[] | null
          is_favorite: boolean
          purchase_date: string | null
          purchase_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          subcategory?: string | null
          brand?: string | null
          color: string
          colors?: string[] | null
          size?: string | null
          image_url: string
          cloudinary_public_id?: string | null
          notes?: string | null
          tags?: string[] | null
          is_favorite?: boolean
          purchase_date?: string | null
          purchase_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          subcategory?: string | null
          brand?: string | null
          color?: string
          colors?: string[] | null
          size?: string | null
          image_url?: string
          cloudinary_public_id?: string | null
          notes?: string | null
          tags?: string[] | null
          is_favorite?: boolean
          purchase_date?: string | null
          purchase_price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          items: Json
          thumbnail_url: string | null
          is_favorite: boolean
          tags: string[] | null
          season: string | null
          occasion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          items: Json
          thumbnail_url?: string | null
          is_favorite?: boolean
          tags?: string[] | null
          season?: string | null
          occasion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          items?: Json
          thumbnail_url?: string | null
          is_favorite?: boolean
          tags?: string[] | null
          season?: string | null
          occasion?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

