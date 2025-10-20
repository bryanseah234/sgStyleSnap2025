
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
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [friends, setFriends] = useState([]);

  // Service instances
  const clothesService = new ClothesService();
  const outfitsService = new OutfitsService();
  const friendsService = new FriendsService();

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

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        // Load items
        const itemsResult = await clothesService.getClothes({
          owner_id: user.id,
          limit: 6
        });
        if (itemsResult.success) {
          setItems(itemsResult.data || []);
        }

        // Load outfits
        const outfitsData = await outfitsService.getOutfits({
          limit: 3
        });
        setOutfits(outfitsData || []);

        // Load friends
        const friendsData = await friendsService.getFriends();
        setFriends(friendsData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [user?.id]);

  const stats = [
    { label: "Items", value: items.length, icon: Shirt, route: "/closet" },
    { label: "Outfits", value: outfits.length, icon: Palette, route: "/outfits" },
    { label: "Friends", value: friends.length, icon: Users, route: "/friends" },
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

    </div>
  );
}
