import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../components/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Heart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import UploadItemModal from "../components/cabinet/uploaditemodal";
import ClothingItemCard from "../components/cabinet/ClothingItemCard";
import CategoryFilter from "../components/cabinet/CategoryFilter";

export default function Cabinet() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("items");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["clothing-items", currentUser?.email],
    queryFn: () => {
      if (!currentUser?.email) return [];
      return base44.entities.ClothingItem.filter(
        { created_by: currentUser.email },
        "-created_date"
      );
    },
    enabled: !!currentUser?.email,
  });

  const { data: outfits = [], isLoading: outfitsLoading } = useQuery({
    queryKey: ["outfits", currentUser?.email],
    queryFn: () => {
      if (!currentUser?.email) return [];
      return base44.entities.Outfit.filter(
        { created_by: currentUser.email },
        "-created_date"
      );
    },
    enabled: !!currentUser?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ClothingItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothing-items"] });
    },
  });

  const deleteOutfitMutation = useMutation({
    mutationFn: (id) => base44.entities.Outfit.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, is_favorite }) =>
      base44.entities.ClothingItem.update(id, { is_favorite: !is_favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothing-items"] });
    },
  });

  const toggleOutfitFavoriteMutation = useMutation({
    mutationFn: ({ id, is_favorite }) =>
      base44.entities.Outfit.update(id, { is_favorite: !is_favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
    },
  });

  const filteredItems = items.filter((item) => {
    const categoryMatch = activeCategory === "all" || item.category === activeCategory;
    const favoriteMatch = !showFavoritesOnly || item.is_favorite;
    return categoryMatch && favoriteMatch;
  });

  const filteredOutfits = showFavoritesOnly 
    ? outfits.filter(outfit => outfit.is_favorite)
    : outfits;

  return (
    <div className="min-h-screen p-6 md:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-2 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}>
              My Cabinet
            </h1>
            <p className={`text-lg ${
              theme === "dark" ? "text-zinc-400" : "text-stone-600"
            }`}>
              {activeTab === "items" 
                ? `${filteredItems.length} ${filteredItems.length === 1 ? "item" : "items"}`
                : `${filteredOutfits.length} ${filteredOutfits.length === 1 ? "outfit" : "outfits"}`
              }
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              variant={showFavoritesOnly ? "default" : "outline"}
              className={`gap-2 ${
                showFavoritesOnly
                  ? theme === "dark"
                    ? "bg-white text-black hover:bg-zinc-100"
                    : "bg-black text-white hover:bg-stone-900"
                  : theme === "dark"
                  ? "border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  : ""
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-red-500 text-red-500" : ""}`} />
              Favorites
            </Button>

            {activeTab === "items" && (
              <Button
                onClick={() => setShowUpload(true)}
                className={`gap-2 ${
                  theme === "dark"
                    ? "bg-white text-black hover:bg-zinc-100"
                    : "bg-black text-white hover:bg-stone-900"
                }`}
              >
                <Plus className="w-5 h-5" />
                Upload Item
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <Button
            onClick={() => setActiveTab("items")}
            variant={activeTab === "items" ? "default" : "outline"}
            className={`rounded-full ${
              activeTab === "items"
                ? theme === "dark"
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : theme === "dark"
                ? "border-zinc-700 text-zinc-400"
                : "border-stone-300 text-stone-600"
            }`}
          >
            My Items
          </Button>
          <Button
            onClick={() => setActiveTab("outfits")}
            variant={activeTab === "outfits" ? "default" : "outline"}
            className={`rounded-full ${
              activeTab === "outfits"
                ? theme === "dark"
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : theme === "dark"
                ? "border-zinc-700 text-zinc-400"
                : "border-stone-300 text-stone-600"
            }`}
          >
            Saved Outfits
          </Button>
        </div>

        {/* Category Filter (only for items) */}
        {activeTab === "items" && (
          <CategoryFilter
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        )}
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto">
        {activeTab === "items" ? (
          // Items Grid
          isLoading ? (
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
              <p className={`text-lg mb-6 ${
                theme === "dark" ? "text-zinc-400" : "text-stone-600"
              }`}>
                {showFavoritesOnly
                  ? "You haven't favorited any items yet"
                  : "Start building your wardrobe"}
              </p>
              {!showFavoritesOnly && (
                <Button
                  onClick={() => setShowUpload(true)}
                  className={`gap-2 ${
                    theme === "dark"
                      ? "bg-white text-black hover:bg-zinc-100"
                      : "bg-black text-white hover:bg-stone-900"
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  Upload Your First Item
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <ClothingItemCard
                    key={item.id}
                    item={item}
                    onDelete={() => deleteMutation.mutate(item.id)}
                    onToggleFavorite={() =>
                      toggleFavoriteMutation.mutate({
                        id: item.id,
                        is_favorite: item.is_favorite,
                      })
                    }
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )
        ) : (
          // Outfits Grid
          outfitsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-[4/3] rounded-3xl ${
                    theme === "dark" ? "bg-zinc-900" : "bg-stone-200"
                  } animate-pulse`}
                />
              ))}
            </div>
          ) : filteredOutfits.length === 0 ? (
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
              } flex items-center justify-center text-4xl`}>
                👔
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}>
                No outfits saved yet
              </h3>
              <p className={`text-lg mb-6 ${
                theme === "dark" ? "text-zinc-400" : "text-stone-600"
              }`}>
                {showFavoritesOnly
                  ? "You haven't favorited any outfits yet"
                  : "Create your first outfit in the Studio"}
              </p>
              {!showFavoritesOnly && (
                <Link to={createPageUrl("Dashboard")}>
                  <Button
                    className={`gap-2 ${
                      theme === "dark"
                        ? "bg-white text-black hover:bg-zinc-100"
                        : "bg-black text-white hover:bg-stone-900"
                    }`}
                  >
                    Go to Outfit Studio
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredOutfits.map((outfit) => (
                  <motion.div
                    key={outfit.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -8 }}
                    className={`group relative aspect-[4/3] rounded-3xl overflow-hidden ${
                      theme === "dark"
                        ? "bg-zinc-900 border border-zinc-800"
                        : "bg-white border border-stone-200"
                    } transition-all duration-300 cursor-pointer`}
                  >
                    <Link to={`${createPageUrl("Dashboard")}?outfit=${outfit.id}`}>
                      <div className="w-full h-full p-4 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-4">👔</div>
                          <h3 className={`font-semibold text-lg ${
                            theme === "dark" ? "text-white" : "text-black"
                          }`}>
                            {outfit.name}
                          </h3>
                        </div>
                      </div>
                    </Link>

                    {/* Favorite Badge */}
                    {outfit.is_favorite && (
                      <div className="absolute top-3 right-3">
                        <div className="p-2 rounded-xl bg-red-500">
                          <Heart className="w-4 h-4 fill-white text-white" />
                        </div>
                      </div>
                    )}

                    {/* Hover Controls */}
                    <div className={`absolute inset-0 ${
                      theme === "dark" ? "bg-black" : "bg-white"
                    } bg-opacity-0 group-hover:bg-opacity-90 transition-all duration-300 flex items-end p-4`}>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleOutfitFavoriteMutation.mutate({
                              id: outfit.id,
                              is_favorite: outfit.is_favorite,
                            });
                          }}
                          variant="outline"
                          size="icon"
                          className={`rounded-xl flex-1 ${
                            outfit.is_favorite
                              ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                              : theme === "dark"
                              ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                              : "border-stone-300 text-stone-700 hover:bg-stone-100"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${outfit.is_favorite ? "fill-current" : ""}`} />
                        </Button>
                        
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteOutfitMutation.mutate(outfit.id);
                          }}
                          variant="outline"
                          size="icon"
                          className={`rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 ${
                            theme === "dark" 
                              ? "border-zinc-700 text-zinc-300" 
                              : "border-stone-300 text-stone-700"
                          }`}
                        >
                          <Filter className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )
        )}
      </div>

      {/* Upload Modal */}
      <UploadItemModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
      />
    </div>
  );
}