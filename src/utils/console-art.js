/**
 * Console Art & Messages
 * 
 * Displays ASCII art and branded messages in the browser console
 * when the page loads and on every page navigation.
 * A delightful easter egg for developers!
 * 
 * To add new ASCII art, simply add it to the PAGE_NAVIGATION_ART array below.
 * 
 * @author StyleSnap Team
 * @version 2.0.0
 */

/**
 * StyleSnap ASCII Logo Variants Collection
 * 
 * 📝 HOW TO ADD MORE LOGO VARIANTS:
 * 
 * Simply add a new object to this array with the following format:
 * 
 * {
 *   name: 'Your Logo Name',  // Optional: helps you identify it later
 *   art: `
 *     Your ASCII logo here
 *     Can span multiple lines
 *     Use backticks for multi-line strings
 *   `
 * }
 * 
 * 💡 TIPS:
 * - Use monospace-friendly characters: ╔ ╗ ╚ ╝ ║ ═ ┌ ┐ └ ┘ │ ─
 * - Keep logos similar in size for consistency
 * - You can include emojis (👔 👗 ✨ etc.)
 * - Test in browser console to see alignment
 * 
 * Each logo will be randomly selected when displayConsoleArt() is called.
 */
export const STYLESNAP_LOGO_VARIANTS = [
  {
    name: 'ASCII Text',
    art: `
███████╗████████╗██╗   ██╗██╗     ███████╗
██╔════╝╚══██╔══╝╚██╗ ██╔╝██║     ██╔════╝
███████╗   ██║    ╚████╔╝ ██║     █████╗  
╚════██║   ██║     ╚██╔╝  ██║     ██╔══╝  
███████║   ██║      ██║   ███████╗███████╗
╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝
                                          
███████╗███╗   ██╗ █████╗ ██████╗         
██╔════╝████╗  ██║██╔══██╗██╔══██╗        
███████╗██╔██╗ ██║███████║██████╔╝        
╚════██║██║╚██╗██║██╔══██║██╔═══╝         
███████║██║ ╚████║██║  ██║██║             
╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝      

    `
  },
  {
    name: 'Classic Box',
    art: `
░█▀▀░▀█▀░█░█░█░░░█▀▀
░▀▀█░░█░░░█░░█░░░█▀▀
░▀▀▀░░▀░░░▀░░▀▀▀░▀▀▀
░█▀▀░█▀█░█▀█░█▀█    
░▀▀█░█░█░█▀█░█▀▀    
░▀▀▀░▀░▀░▀░▀░▀░░    

    `
  },
  {
    name: 'Simple Frame',
    art: `
 ________  _________    ___    ___ ___       _______      
|\\   ____\\|\\___   ___\\ |\\  \\  /  /|\\  \\     |\\  ___ \\     
\\ \\  \\___\\|\\|___ \\  \\_| \\ \\  \\/  / | \\  \\    \\ \\   __/|    
 \\ \\_____  \\   \\ \\  \\   \\ \\    / / \\ \\  \\    \\ \\  \\_|/__  
  \\|____|\\  \\   \\ \\  \\   \\/  /  /   \\ \\  \\____\\ \\  \\_|\\ \\ 
    ____\\_\\  \\   \\ \\__\\__/  / /      \\ \\_______\\ \\_______\\
   |\\_________\\   \\|__|\\___/ /        \\|_______|\\|_______|
   \\|_________|       \\|___|/                             
                                                          
                                                          
 ________  ________   ________  ________                  
|\\   ____\\|\\   ___  \\|\\   __  \\|\\   __  \\                 
\\ \\  \\___\\|\\ \\  \\\\ \\  \\ \\  \\|\\  \\ \\  \\|\\  \\                
 \\ \\_____  \\ \\  \\\\ \\  \\ \\   __  \\ \\   ____\\               
  \\|____|\\  \\ \\  \\\\ \\  \\ \\  \\ \\  \\ \\  \\___|               
    ____\\_\\  \\ \\__\\\\ \\__\\ \\__\\ \\__\\ \\__\\                  
   |\\_________\\|__| \\|__|\\|__|\\|__|\\|__|                  
   \\|_________|                                           

    `
  },
  {
    name: 'Minimal',
    art: `
  ******** ********** **    ** **       ********
 **////// /////**/// //**  ** /**      /**///// 
/**           /**     //****  /**      /**      
/*********    /**      //**   /**      /******* 
////////**    /**       /**   /**      /**////  
       /**    /**       /**   /**      /**      
 ********     /**       /**   /********/********
////////      //        //    //////// //////// 
  ******** ****     **     **     *******       
 **////// /**/**   /**    ****   /**////**      
/**       /**//**  /**   **//**  /**   /**      
/*********/** //** /**  **  //** /*******       
////////**/**  //**/** **********/**////        
       /**/**   //****/**//////**/**            
 ******** /**    //***/**     /**/**            
////////  //      /// //      // //             

    `
  },
  {
    name: 'Bordered',
    art: `
  ______   ________  __      __  __        ________ 
 /      \\ /        |/  \\    /  |/  |      /        |
/$$$$$$  |$$$$$$$$/ $$  \\  /$$/ $$ |      $$$$$$$$/ 
$$ \\__$$/    $$ |    $$  \\/$$/  $$ |      $$ |__    
$$      \\    $$ |     $$  $$/   $$ |      $$    |   
 $$$$$$  |   $$ |      $$$$/    $$ |      $$$$$/    
/  \\__$$ |   $$ |       $$ |    $$ |_____ $$ |_____ 
$$    $$/    $$ |       $$ |    $$       |$$       |
 $$$$$$/     $$/        $$/     $$$$$$$$/ $$$$$$$$/ 
                                                    
                                                    
                                                    
  ______   __    __   ______   _______              
 /      \\ /  \\  /  | /      \\ /       \\             
/$$$$$$  |$$  \\ $$ |/$$$$$$  |$$$$$$$  |            
$$ \\__$$/ $$$  \\$$ |$$ |__$$ |$$ |__$$ |            
$$      \\ $$$$  $$ |$$    $$ |$$    $$/             
 $$$$$$  |$$ $$ $$ |$$$$$$$$ |$$$$$$$/              
/  \\__$$ |$$ |$$$$ |$$ |  $$ |$$ |                  
$$    $$/ $$ | $$$ |$$ |  $$ |$$ |                  
 $$$$$$/  $$/   $$/ $$/   $$/ $$/                   
                                                    
                                                    
    `
  },
  {
    name: 'Elegant',
    art: `
  █████████  ███████████ █████ █████ █████       ██████████
 ███▒▒▒▒▒███▒█▒▒▒███▒▒▒█▒▒███ ▒▒███ ▒▒███       ▒▒███▒▒▒▒▒█
▒███    ▒▒▒ ▒   ▒███  ▒  ▒▒███ ███   ▒███        ▒███  █ ▒ 
▒▒█████████     ▒███      ▒▒█████    ▒███        ▒██████   
 ▒▒▒▒▒▒▒▒███    ▒███       ▒▒███     ▒███        ▒███▒▒█   
 ███    ▒███    ▒███        ▒███     ▒███      █ ▒███ ▒   █
▒▒█████████     █████       █████    ███████████ ██████████
 ▒▒▒▒▒▒▒▒▒     ▒▒▒▒▒       ▒▒▒▒▒    ▒▒▒▒▒▒▒▒▒▒▒ ▒▒▒▒▒▒▒▒▒▒ 
                                                           
                                                           
                                                           
  █████████  ██████   █████   █████████   ███████████      
 ███▒▒▒▒▒███▒▒██████ ▒▒███   ███▒▒▒▒▒███ ▒▒███▒▒▒▒▒███     
▒███    ▒▒▒  ▒███▒███ ▒███  ▒███    ▒███  ▒███    ▒███     
▒▒█████████  ▒███▒▒███▒███  ▒███████████  ▒██████████      
 ▒▒▒▒▒▒▒▒███ ▒███ ▒▒██████  ▒███▒▒▒▒▒███  ▒███▒▒▒▒▒▒       
 ███    ▒███ ▒███  ▒▒█████  ▒███    ▒███  ▒███             
▒▒█████████  █████  ▒▒█████ █████   █████ █████            
 ▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒    ▒▒▒▒▒ ▒▒▒▒▒   ▒▒▒▒▒ ▒▒▒▒▒             
                                                           
                                                           
    `
  },
  {
    name: 'Double Border',
    art: `
      ___           ___           ___           ___       ___     
     /\\  \\         /\\  \\         |\\__\\         /\\__\\     /\\  \\    
    /::\\  \\        \\:\\  \\        |:|  |       /:/  /    /::\\  \\   
   /:/\\ \\  \\        \\:\\  \\       |:|  |      /:/  /    /:/\\:\\  \\  
  _\\:\\~\\ \\  \\       /::\\  \\      |:|__|__   /:/  /    /::\\~\\:\\  \\ 
 /\\ \\:\\ \\ \\__\\     /:/\\:\\__\\     /::::\\__\\ /:/__/    /:/\\:\\ \\:\\__\\
 \\:\\ \\:\\ \\/__/    /:/  \\/__/    /:/~~/~    \\:\\  \\    \\:\\~\\:\\ \\/__/
  \\:\\ \\:\\__\\     /:/  /        /:/  /       \\:\\  \\    \\:\\ \\:\\__\\  
   \\:\\/:/  /     \\/__/         \\/__/         \\:\\  \\    \\:\\ \\/__/  
    \\::/  /                                   \\:\\__\\    \\:\\__\\    
     \\/__/                                     \\/__/     \\/__/    
      ___           ___           ___           ___               
     /\\  \\         /\\__\\         /\\  \\         /\\  \\              
    /::\\  \\       /::|  |       /::\\  \\       /::\\  \\             
   /:/\\ \\  \\     /:|:|  |      /:/\\:\\  \\     /:/\\:\\  \\            
  _\\:\\~\\ \\  \\   /:/|:|  |__   /::\\~\\:\\  \\   /::\\~\\:\\  \\           
 /\\ \\:\\ \\ \\__\\ /:/ |:| /\\__\\ /:/\\:\\ \\:\\__\\ /:/\\:\\ \\:\\__\\          
 \\:\\ \\:\\ \\/__/ \\/__|:|/:/  / \\/__\\:\\/:/  / \\/__\\:\\/:/  /          
  \\:\\ \\:\\__\\       |:/:/  /       \\::/  /       \\::/  /           
   \\:\\/:/  /       |::/  /        /:/  /         \\/__/            
    \\::/  /        /:/  /        /:/  /                           
     \\/__/         \\/__/         \\/__/                            
    `
  }
]

/**
 * Get a random StyleSnap logo variant
 * @returns {string} Random logo ASCII art
 */
function getRandomLogo() {
  const randomLogo = STYLESNAP_LOGO_VARIANTS[
    Math.floor(Math.random() * STYLESNAP_LOGO_VARIANTS.length)
  ]
  return randomLogo.art
}

/**
 * ASCII Art Collection for Page Navigation
 * 
 * 📝 HOW TO ADD MORE ASCII ART:
 * 
 * Simply add a new object to this array with the following format:
 * 
 * {
 *   name: 'Your Art Name',  // Optional: helps you identify it later
 *   art: `
 *     Your ASCII art here
 *     Can span multiple lines
 *     Use backticks for multi-line strings
 *   `
 * }
 * 
 * 💡 TIPS:
 * - Use monospace-friendly characters: ┌ ┐ └ ┘ │ ─ ═ ║ ╔ ╗ ╚ ╝
 * - Keep width reasonable (30-50 characters max for best display)
 * - Use emojis sparingly (they can break alignment)
 * - Test in browser console to see how it looks
 * - Each art piece will be randomly selected on page navigation
 * 
 * ✨ EXAMPLE:
 * {
 *   name: 'Cool Logo',
 *   art: `
 *     ┌──────┐
 *     │ Style│
 *     └──────┘
 *   `
 * }
 * 
 * The system will randomly select one to display on each page navigation.
 */
export const PAGE_NAVIGATION_ART = [
  {
    name: 'Wardrobe',
    art: `
  ┌───────────────────┐
  │   👔   👗   👕   
  │   📿   👠   👟  
  │                   
  └───────────────────┘
    `
  },
  {
    name: 'Inverse Star Tree',
    art: `
    | ⭐ |
    | ╲ ╱ |
    | ✨ |
    | ╲ ╱ |
    | ⭐ |
    `
  },
  {
    name: 'Fashion Rocket',
    art: `
        ▲
       ▲ ▲
      ▲ ▲ ▲
     ▲ ▲ ▲ ▲
    `
  },
  {
    name: 'Wardrobe Peep Hole',
    art: `
    ┌─────────────┐
    │  🎩        
    │  👔  👗    │
    │  👠  👟    │
    │             │
    └─────────────┘
    `
  },
  {
    name: 'Sparkly',
    art: `
    ✨     ✨
      Style
    ✨     ✨
    `
  },
  {
    name: 'Hearts',
    art: `
      💚💚💚💚
    ┌─────┐
    │Style│
    └─────┘
      💚💚💚💚
    `
  },
  {
    name: 'Fashion Forward',
    art: `
    ──────►
     StyleSnap
    ──────►
    `
  }
]

/**
 * Welcome messages with brand personality
 */
const WELCOME_MESSAGES = [
  "🎨 Like StyleSnap? Share us with a friend!",
  "💡 Pro tip: Press Shift+D to see performance stats",
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
    
    // Display random logo variant
    console.log('%c' + getRandomLogo(), STYLES.logo)
    
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

/**
 * Display ASCII art on page navigation
 * 
 * Randomly selects and displays the logo first, then one of the ASCII art pieces
 * from PAGE_NAVIGATION_ART collection.
 * 
 * @param {string} routeName - Optional route name for context
 */
export function displayPageNavigationArt(routeName = null) {
  try {
    // Skip on initial page load to avoid duplicate with displayConsoleArt
    // Only show on actual navigation
    if (!routeName || routeName === '/') {
      return
    }

    // Skip landing and login pages
    if (routeName === '/login' || routeName === '/auth/callback') {
      return
    }

    // Display logo first
    const randomLogo = getRandomLogo()
    const logoStyle = 'color: #8b5cf6; font-weight: bold; font-size: 12px; font-family: monospace; line-height: 1.2;'
    console.log('%c' + randomLogo, logoStyle)
    
    // Get a random ASCII art piece
    const randomArt = PAGE_NAVIGATION_ART[Math.floor(Math.random() * PAGE_NAVIGATION_ART.length)]
    
    // Display art with styling
    const artStyle = 'color: #8b5cf6; font-weight: bold; font-size: 11px; font-family: monospace; line-height: 1.2;'
    console.log('%c' + randomArt.art, artStyle)
    
    // Optional: Show route name
    if (routeName) {
      const routeStyle = 'color: #10b981; font-size: 11px; font-weight: bold;'
      console.log('%c📍 ' + routeName, routeStyle)
    }
    
    console.log('\n') // Extra spacing
  } catch (error) {
    // Silent fail - console art is a nice-to-have
    console.error('Failed to display navigation art:', error)
  }
}

/**
 * Add a new ASCII art piece to the collection
 * 
 * Helper function to easily add new ASCII art from anywhere in the codebase
 * 
 * @param {Object} artObject - Object with { name: string, art: string }
 * @example
 * addNavigationArt({
 *   name: 'My Cool Art',
 *   art: `
 *     ┌─────┐
 *     │ ART │
 *     └─────┘
 *   `
 * })
 */
export function addNavigationArt(artObject) {
  if (!artObject || !artObject.art) {
    console.warn('addNavigationArt: Invalid art object provided')
    return
  }
  
  PAGE_NAVIGATION_ART.push({
    name: artObject.name || 'Unnamed Art',
    art: artObject.art
  })
  
  console.log(`✅ Added new ASCII art: ${artObject.name || 'Unnamed Art'}`)
}

/**
 * Add a new StyleSnap logo variant
 * 
 * Helper function to easily add new logo styles from anywhere in the codebase
 * 
 * @param {Object} logoObject - Object with { name: string, art: string }
 * @example
 * addLogoVariant({
 *   name: 'My Cool Logo',
 *   art: `
 *     ╔═══════╗
 *     ║ Style ║
 *     ╚═══════╝
 *   `
 * })
 */
export function addLogoVariant(logoObject) {
  if (!logoObject || !logoObject.art) {
    console.warn('addLogoVariant: Invalid logo object provided')
    return
  }
  
  STYLESNAP_LOGO_VARIANTS.push({
    name: logoObject.name || 'Unnamed Logo',
    art: logoObject.art
  })
  
  console.log(`✅ Added new logo variant: ${logoObject.name || 'Unnamed Logo'}`)
}

