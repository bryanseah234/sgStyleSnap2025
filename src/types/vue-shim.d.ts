/**
 * Vue Component Type Shims
 * 
 * Provides TypeScript support for Vue single-file components
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Lucide Vue Next icons
declare module 'lucide-vue-next' {
  import type { DefineComponent } from 'vue'
  export const Shirt: DefineComponent
  export const Palette: DefineComponent
  export const Users: DefineComponent
  export const Search: DefineComponent
  export const Heart: DefineComponent
  export const Smartphone: DefineComponent
  export const Sun: DefineComponent
  export const Moon: DefineComponent
  export const Plus: DefineComponent
  export const X: DefineComponent
  export const ChevronLeft: DefineComponent
  export const ChevronRight: DefineComponent
  export const LogOut: DefineComponent
  export const Settings: DefineComponent
  export const Bell: DefineComponent
  export const User: DefineComponent
  export const Home: DefineComponent
  // Add other icons as needed
}

// Motion library
declare module 'motion' {
  export const motion: any
  export const useMotion: any
}

