/**
 * Icons Configuration - StyleSnap
 * 
 * Purpose: Centralized icon definitions and icon library setup
 * 
 * Icon Library Options:
 * - Heroicons (recommended, free, Tailwind-compatible)
 * - Font Awesome
 * - Material Icons
 * - Custom SVG icons
 * 
 * Icon Categories Needed:
 * - Navigation: home, user, friends, heart/star, bell
 * - Actions: plus, edit, delete, search, filter, sort
 * - Social: share, like, comment
 * - Closet: shirt, pants, shoe, jacket, accessory
 * - Status: check, x, warning, info
 * - UI: chevron, arrow, menu, close, loading
 * 
 * Usage:
 * import icons from '@/config/icons'
 * const HomeIcon = icons.home
 * 
 * <component :is="icons.home" class="w-6 h-6" />
 * 
 * Or: Create Icon component wrapper:
 * <Icon name="home" size="md" />
 * 
 * Installation:
 * npm install @heroicons/vue
 * 
 * Reference:
 * - Heroicons: https://heroicons.com/
 * - Used throughout components for UI icons
 */

// TODO: Import icon library
// import { HomeIcon, UserIcon, ... } from '@heroicons/vue/24/outline'

export default {
  // Navigation
  // home: HomeIcon,
  // user: UserIcon,
  // friends: UsersIcon,
  // suggestions: SparklesIcon,
  // bell: BellIcon,
  
  // Actions
  // plus: PlusIcon,
  // edit: PencilIcon,
  // delete: TrashIcon,
  // search: MagnifyingGlassIcon,
  // filter: FunnelIcon,
  // sort: BarsArrowUpIcon,
  
  // Social
  // share: ShareIcon,
  // like: HeartIcon,
  
  // Closet categories
  // top: // TODO: Find suitable icon or use custom SVG
  // bottom: // TODO: Find suitable icon or use custom SVG
  // shoe: // TODO: Find suitable icon or use custom SVG
  // outerwear: // TODO: Find suitable icon or use custom SVG
  // accessory: // TODO: Find suitable icon or use custom SVG
  
  // Status
  // check: CheckIcon,
  // x: XMarkIcon,
  // warning: ExclamationTriangleIcon,
  // info: InformationCircleIcon,
  
  // UI
  // chevronDown: ChevronDownIcon,
  // chevronUp: ChevronUpIcon,
  // chevronLeft: ChevronLeftIcon,
  // chevronRight: ChevronRightIcon,
  // menu: Bars3Icon,
  // close: XMarkIcon,
  // loading: ArrowPathIcon,
}
