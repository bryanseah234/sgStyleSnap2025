/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly VITE_FASHIONRNN_API_URL: string
  readonly VITE_BASE44_API_URL: string
  readonly VITE_FORCE_MOCK_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

