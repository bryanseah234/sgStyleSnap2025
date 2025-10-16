
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { api } from "@/api/client";
import { useTheme, ThemeProvider } from "./ThemeContext";
import { 
  Home, 
  Shirt, 
  Users, 
  Palette, 
  User as UserIcon,
  Sun,
  Moon,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LayoutContent({ children }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const navigationItems = [
    { name: "Home", path: createPageUrl("Home"), icon: Home },
    { name: "Cabinet", path: createPageUrl("Cabinet"), icon: Shirt },
    { name: "Outfit Studio", path: createPageUrl("Dashboard"), icon: Palette },
    { name: "Friends", path: createPageUrl("Friends"), icon: Users },
    { name: "Profile", path: createPageUrl("Profile"), icon: UserIcon },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-black" : "bg-stone-50"
      }`}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-16 h-16 rounded-full border-4 border-black dark:border-white"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === "dark" 
        ? "bg-black text-white" 
        : "bg-stone-50 text-black"
    }`} style={{ transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out' }}>
      
      {/* Desktop Sidebar Navigation */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`hidden md:flex fixed left-0 top-0 h-full w-64 ${
          theme === "dark" 
            ? "bg-zinc-950 border-r border-zinc-800" 
            : "bg-white border-r border-stone-200"
        } flex-col items-stretch py-8 px-4 z-50`}
        style={{ transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out' }}
      >
        {/* Logo */}
        <div className="mb-12 text-center md:text-left">
          <h1 className={`text-2xl font-bold tracking-tight ${
            theme === "dark" ? "text-white" : "text-black"
          }`}>
            StyleSnap
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.name} to={item.path}>
                <motion.div
                  whileHover={{ x: 4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-start gap-3 px-4 py-3 rounded-xl group relative ${
                    isActive
                      ? theme === "dark"
                        ? "bg-white text-black"
                        : "bg-black text-white"
                      : theme === "dark"
                      ? "hover:bg-zinc-900 text-zinc-400 hover:text-white"
                      : "hover:bg-stone-100 text-stone-600 hover:text-black"
                  }`}
                  style={{ transition: 'all 0.15s ease-in-out' }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle & Logout */}
        <div className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl ${
              theme === "dark"
                ? "hover:bg-zinc-900 text-zinc-300 hover:text-white"
                : "hover:bg-stone-100 text-stone-700 hover:text-black"
            }`}
            style={{ transition: 'all 0.15s ease-in-out' }}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-5 h-5" />
                <span className="font-medium">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span className="font-medium">Dark Mode</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => api.auth.logout()}
            className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl ${
              theme === "dark"
                ? "hover:bg-red-950 text-zinc-300 hover:text-red-400"
                : "hover:bg-red-50 text-stone-700 hover:text-red-600"
            }`}
            style={{ transition: 'all 0.15s ease-in-out' }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`md:hidden fixed bottom-0 left-0 right-0 ${
          theme === "dark"
            ? "bg-zinc-950/95 border-t border-zinc-800"
            : "bg-white/95 border-t border-stone-200"
        } backdrop-blur-xl z-50 px-2 py-3 pb-safe`}
        style={{ 
          transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))'
        }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.name} to={item.path} className="relative flex-1">
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="flex flex-col items-center justify-center gap-1 py-2"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className={`p-2.5 rounded-2xl ${
                      isActive
                        ? theme === "dark"
                          ? "bg-white"
                          : "bg-black"
                        : "bg-transparent"
                    }`}
                    style={{ transition: 'background-color 0.2s ease-in-out' }}
                  >
                    <Icon 
                      className={`w-5 h-5 ${
                        isActive
                          ? theme === "dark"
                            ? "text-black"
                            : "text-white"
                          : theme === "dark"
                          ? "text-zinc-400"
                          : "text-stone-600"
                      }`}
                      style={{ transition: 'color 0.2s ease-in-out' }}
                    />
                  </motion.div>
                  
                  <motion.span
                    animate={{
                      opacity: isActive ? 1 : 0.6,
                      scale: isActive ? 1 : 0.9
                    }}
                    className={`text-xs font-medium ${
                      isActive
                        ? theme === "dark"
                          ? "text-white"
                          : "text-black"
                        : theme === "dark"
                        ? "text-zinc-500"
                        : "text-stone-500"
                    }`}
                    style={{ transition: 'color 0.2s ease-in-out' }}
                  >
                    {item.name === "Outfit Studio" ? "Studio" : item.name}
                  </motion.span>

                  {/* Active indicator - Properly positioned at top */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full ${
                        theme === "dark" ? "bg-white" : "bg-black"
                      }`}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="md:ml-64 pb-24 md:pb-0 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}
