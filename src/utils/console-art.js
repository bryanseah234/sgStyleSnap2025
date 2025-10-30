/**
 * Console Art & Messages
 * 
 * Displays ASCII art and branded messages in the browser console
 * when the page loads. A delightful easter egg for developers!
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

/**
 * StyleSnap ASCII Logo
 * Simple, clean representation of a wardrobe/closet icon
 */
const STYLESNAP_LOGO = `
  ╔═══════════════════════════════════╗
  ║                                   ║
  ║     ┌───────────────────────┐    ║
  ║     │  👔    StyleSnap   👗 │    ║
  ║     │                       │    ║
  ║     │   Your Digital        │    ║
  ║     │   Wardrobe ✨         │    ║
  ║     │                       │    ║
  ║     └───────────────────────┘    ║
  ║                                   ║
  ╚═══════════════════════════════════╝
`

/**
 * Welcome messages with brand personality
 */
const WELCOME_MESSAGES = [
  "🎨 Like StyleSnap? Share us with a friend!",
  "💡 Pro tip: Press Shift+F to see performance stats",
  "🔍 Type 'debug' anywhere to unlock developer mode",
  "✨ We put love into every pixel. Hope you enjoy!",
  "👋 Hello, fellow developer! Thanks for checking us out!"
]

/**
 * Hidden messages for curious developers
 */
const DEVELOPER_MESSAGES = [
  "🎯 Easter Egg Hunt: Try the Konami code (↑↑↓↓←→←→)",
  "🐰 Hidden Secret: Triple-click on an avatar for a surprise",
  "🎪 Tech Stack: Vue 3 + Three.js + Tailwind CSS + Vite",
  "💼 We're building the future of fashion organization",
  "🚀 Built with passion by the StyleSnap team",
  "🌟 Fun fact: This page has 5+ easter eggs. Can you find them all?"
]

/**
 * Console styles for colored output
 */
const STYLES = {
  logo: 'color: #8b5cf6; font-weight: bold; font-size: 12px; font-family: monospace; line-height: 1.2;',
  welcome: 'color: #10b981; font-size: 14px; font-weight: bold;',
  message: 'color: #6366f1; font-size: 12px;',
  hint: 'color: #f59e0b; font-size: 11px; font-style: italic;',
  divider: 'color: #94a3b8; font-size: 11px;'
}

/**
 * Display console art on page load
 */
export function displayConsoleArt() {
  // Check if already displayed in this session
  if (sessionStorage.getItem('stylesnap-console-art-shown')) {
    return
  }
  
  try {
    // Clear console for dramatic effect (optional)
    // console.clear()
    
    // Display logo
    console.log('%c' + STYLESNAP_LOGO, STYLES.logo)
    
    // Welcome message
    const randomWelcome = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]
    console.log('%c' + randomWelcome, STYLES.welcome)
    
    // Divider
    console.log('%c' + '─'.repeat(50), STYLES.divider)
    
    // Developer messages (show 2-3 random ones)
    const shuffled = [...DEVELOPER_MESSAGES].sort(() => Math.random() - 0.5)
    shuffled.slice(0, 3).forEach(msg => {
      console.log('%c' + msg, STYLES.message)
    })
    
    // Divider
    console.log('%c' + '─'.repeat(50), STYLES.divider)
    
    // Call to action
    console.log(
      '%cWant to join our team? Check out careers at stylesnap.com',
      STYLES.hint
    )
    
    // Mark as shown
    sessionStorage.setItem('stylesnap-console-art-shown', 'true')
    
    console.log('\n') // Extra spacing
  } catch (error) {
    // Silent fail - console art is a nice-to-have
    console.error('Failed to display console art:', error)
  }
}

/**
 * Display a custom console message
 */
export function logStyled(message, style = 'message') {
  console.log('%c' + message, STYLES[style] || STYLES.message)
}

/**
 * Display achievement message when user finds an easter egg
 */
export function displayAchievement(name, description) {
  console.log(
    '%c🏆 Achievement Unlocked!',
    'color: #fbbf24; font-size: 16px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);'
  )
  console.log('%c' + name, 'color: #8b5cf6; font-size: 14px; font-weight: bold;')
  console.log('%c' + description, 'color: #6b7280; font-size: 12px;')
  console.log('\n')
}

