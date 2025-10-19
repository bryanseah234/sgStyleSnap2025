
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../components/ThemeContext";
import { motion } from "framer-motion";
import { Shirt, Palette, Users, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const { data: items = [] } = useQuery({
    queryKey: ["clothing-items-home", user?.email],
    queryFn: () => {
      if (!user?.email) return [];
      return base44.entities.ClothingItem.filter(
        { created_by: user.email },
        "-created_date",
        6
      );
    },
    enabled: !!user?.email,
  });

  const { data: outfits = [] } = useQuery({
    queryKey: ["outfits"],
    queryFn: () => base44.entities.Outfit.list("-created_date", 3),
  });

  const stats = [
    { label: "Items", value: items.length, icon: Shirt, route: "/cabinet" },
    { label: "Outfits", value: outfits.length, icon: Palette, route: "/dashboard" },
    { label: "Friends", value: 0, icon: Users, route: "/friends" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      {/* Loading Bar Animation */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className={`h-1 w-full mb-12 rounded-full ${
          theme === "dark" 
            ? "bg-gradient-to-r from-zinc-700 via-white to-zinc-700" 
            : "bg-gradient-to-r from-stone-300 via-black to-stone-300"
        }`}
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="max-w-6xl mx-auto mb-16"
      >
        <h1 className={`text-5xl md:text-7xl font-bold tracking-tight mb-4 ${
          theme === "dark" ? "text-white" : "text-black"
        }`}>
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ""}
        </h1>
        <p className={`text-xl md:text-2xl ${
          theme === "dark" ? "text-zinc-400" : "text-stone-600"
        } max-w-2xl`}>
          Your digital wardrobe awaits. Create stunning outfits, discover new styles, and share your fashion journey.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.route}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`p-8 rounded-3xl ${
                  theme === "dark"
                    ? "bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
                    : "bg-white border border-stone-200 hover:border-stone-300"
                } transition-all duration-300 group cursor-pointer`}
              >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${
                  theme === "dark" ? "bg-zinc-800" : "bg-stone-100"
                } group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-4xl font-bold ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}>
                  {stat.value}
                </span>
              </div>
              <p className={`text-lg font-medium ${
                theme === "dark" ? "text-zinc-400" : "text-stone-600"
              }`}>
                {stat.label}
              </p>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Cabinet Preview */}
        <Link to={createPageUrl("Cabinet")}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-8 rounded-3xl ${
              theme === "dark"
                ? "bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700"
                : "bg-gradient-to-br from-white to-stone-50 border border-stone-200"
            } group cursor-pointer overflow-hidden relative h-64`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${
              theme === "dark" 
                ? "from-blue-500/10 to-purple-500/10" 
                : "from-blue-500/5 to-purple-500/5"
            } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}>
                  Your Cabinet
                </h3>
                <ArrowRight className={`w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300 ${
                  theme === "dark" ? "text-zinc-400" : "text-stone-600"
                }`} />
              </div>
              <p className={`text-lg mb-6 ${
                theme === "dark" ? "text-zinc-400" : "text-stone-600"
              }`}>
                Browse and organize your wardrobe
              </p>
              <div className="flex gap-4">
                {items.slice(0, 3).map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className={`w-16 h-16 rounded-xl ${
                      theme === "dark" ? "bg-zinc-800" : "bg-stone-100"
                    } overflow-hidden`}
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Outfits Preview */}
        <Link to={createPageUrl("Dashboard")}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-8 rounded-3xl ${
              theme === "dark"
                ? "bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700"
                : "bg-gradient-to-br from-white to-stone-50 border border-stone-200"
            } group cursor-pointer overflow-hidden relative h-64`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${
              theme === "dark" 
                ? "from-pink-500/10 to-orange-500/10" 
                : "from-pink-500/5 to-orange-500/5"
            } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}>
                  Outfits
                </h3>
                <ArrowRight className={`w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300 ${
                  theme === "dark" ? "text-zinc-400" : "text-stone-600"
                }`} />
              </div>
              <p className={`text-lg ${
                theme === "dark" ? "text-zinc-400" : "text-stone-600"
              }`}>
                Mix and match your items on the canvas
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Friends Preview */}
        <Link to={createPageUrl("Friends")}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-8 rounded-3xl ${
              theme === "dark"
                ? "bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700"
                : "bg-gradient-to-br from-white to-stone-50 border border-stone-200"
            } group cursor-pointer overflow-hidden relative h-64`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${
              theme === "dark" 
                ? "from-green-500/10 to-blue-500/10" 
                : "from-green-500/5 to-blue-500/5"
            } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}>
                  Friends
                </h3>
                <ArrowRight className={`w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300 ${
                  theme === "dark" ? "text-zinc-400" : "text-stone-600"
                }`} />
              </div>
              <p className={`text-lg ${
                theme === "dark" ? "text-zinc-400" : "text-stone-600"
              }`}>
                Connect and share with friends
              </p>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
