import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../components/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Filter, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useState, useEffect } from "react";

import CategoryFilter from "../components/cabinet/CategoryFilter";

export default function FriendCabinet() {
  const { theme } = useTheme();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  
  const urlParams = new URLSearchParams(location.search);
  const friendEmail = urlParams.get("email");
  const friendName = urlParams.get("name");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await api.auth.me();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const { data: friendships = [] } = useQuery({
    queryKey: ["friendships-check", currentUser?.email, friendEmail],
    queryFn: () => {
      if (!currentUser?.email || !friendEmail) return [];
      return api.entities.Friendship.filter(
        { created_by: currentUser.email, friend_email: friendEmail, status: "accepted" },
        "-created_date"
      );
    },
    enabled: !!currentUser?.email && !!friendEmail,
    onSuccess: (data) => {
      setIsFriend(data.length > 0);
    }
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["friend-items", friendEmail],
    queryFn: () => {
      if (!friendEmail) return [];
      return api.entities.ClothingItem.filter(
        { created_by: friendEmail },
        "-created_date"
      );
    },
    enabled: !!friendEmail && isFriend,
  });

  const filteredItems = items.filter((item) => 
    activeCategory === "all" || item.category === activeCategory
  );

  // Show access denied if not friends
  if (currentUser && !isLoading && !isFriend && friendships.length === 0) {
    return (
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to={createPageUrl("Friends")}>
              <Button variant="outline" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-24 rounded-3xl ${
              theme === "dark"
                ? "bg-zinc-900 border border-zinc-800"
                : "bg-white border border-stone-200"
            }`}
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${
              theme === "dark" ? "bg-zinc-800" : "bg-stone-100"
            } flex items-center justify-center`}>
              <Lock className={`w-12 h-12 ${
                theme === "dark" ? "text-zinc-600" : "text-stone-400"
              }`} />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}>
              Private Cabinet
            </h3>
            <p className={`text-lg ${
              theme === "dark" ? "text-zinc-400" : "text-stone-600"
            }`}>
              You need to be friends with {friendName} to view their cabinet
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Friends")}>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-2 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}>
                {friendName}'s Cabinet
              </h1>
              <p className={`text-lg ${
                theme === "dark" ? "text-zinc-400" : "text-stone-600"
              }`}>
                {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array(10).fill(0).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-3xl ${
                  theme === "dark" ? "bg-zinc-900" : "bg-stone-200"
                } animate-pulse`}
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-24 rounded-3xl ${
              theme === "dark"
                ? "bg-zinc-900 border border-zinc-800"
                : "bg-white border border-stone-200"
            }`}
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${
              theme === "dark" ? "bg-zinc-800" : "bg-stone-100"
            } flex items-center justify-center`}>
              <Filter className={`w-12 h-12 ${
                theme === "dark" ? "text-zinc-600" : "text-stone-400"
              }`} />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}>
              No items found
            </h3>
            <p className={`text-lg ${
              theme === "dark" ? "text-zinc-400" : "text-stone-600"
            }`}>
              {friendName} hasn't added any items yet
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8 }}
                  className={`group relative aspect-square rounded-3xl overflow-hidden ${
                    theme === "dark"
                      ? "bg-zinc-900 border border-zinc-800"
                      : "bg-white border border-stone-200"
                  } transition-all duration-300 cursor-pointer`}
                >
                  <div className="w-full h-full p-4 flex items-center justify-center">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  <div className={`absolute inset-0 ${
                    theme === "dark" ? "bg-black" : "bg-white"
                  } bg-opacity-0 group-hover:bg-opacity-90 transition-all duration-300 flex flex-col justify-end p-4`}>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className={`font-semibold text-lg mb-1 ${
                        theme === "dark" ? "text-white" : "text-black"
                      }`}>
                        {item.name}
                      </h3>
                      <p className={`text-sm ${
                        theme === "dark" ? "text-zinc-400" : "text-stone-600"
                      }`}>
                        {item.category}
                        {item.brand && ` • ${item.brand}`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}