
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../components/ThemeContext";
import { motion } from "framer-motion";
import { Shirt, Palette, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ClothesService } from "@/services/clothesService";
import { OutfitsService } from "@/services/outfitsService";
import { FriendsService } from "@/services/friendsService";

export default function Home() {
  const { theme } = useTheme();

  // Service instances
  const clothesService = new ClothesService();
  const outfitsService = new OutfitsService();
  const friendsService = new FriendsService();

  // Get user data with React Query (cached)
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Load items with React Query (cached and parallel)
  const { data: items = [] } = useQuery({
    queryKey: ["home-items", user?.id],
    queryFn: async () => {
      const result = await clothesService.getClothes({
        owner_id: user.id,
        limit: 6
      });
      return result.success ? result.data || [] : [];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Load outfits with React Query (cached and parallel)
  const { data: outfits = [] } = useQuery({
    queryKey: ["home-outfits", user?.id],
    queryFn: () => outfitsService.getOutfits({ limit: 3 }),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Load friends with React Query (cached and parallel)
  const { data: friends = [] } = useQuery({
    queryKey: ["home-friends", user?.id],
    queryFn: () => friendsService.getFriends(),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  const stats = [
    { label: "Items", value: items.length, icon: Shirt, route: "/closet" },
    { label: "Outfits", value: outfits.length, icon: Palette, route: "/outfits" },
    { label: "Friends", value: friends.length, icon: Users, route: "/friends" },
  ];

  return (
    <div className={`min-h-screen p-6 md:p-12 ${
      theme === "dark" ? "bg-black" : "bg-stone-50"
    }`}>
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

    </div>
  );
}
