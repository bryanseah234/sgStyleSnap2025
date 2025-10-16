import React from "react";
import { useTheme } from "../ThemeContext";
import { motion } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClothingItemCard({ item, onDelete, onToggleFavorite }) {
  const { theme } = useTheme();

  return (
    <motion.div
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
      {/* Image */}
      <div className="w-full h-full p-4 flex items-center justify-center">
        <img
          src={item.image_url}
          alt={item.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Overlay */}
      <div className={`absolute inset-0 ${
        theme === "dark" ? "bg-black" : "bg-white"
      } bg-opacity-0 group-hover:bg-opacity-90 transition-all duration-300 flex flex-col justify-end p-4`}>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className={`font-semibold text-lg mb-1 ${
            theme === "dark" ? "text-white" : "text-black"
          }`}>
            {item.name}
          </h3>
          <p className={`text-sm mb-3 ${
            theme === "dark" ? "text-zinc-400" : "text-stone-600"
          }`}>
            {item.category}
            {item.brand && ` • ${item.brand}`}
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              variant="outline"
              size="icon"
              className={`rounded-xl ${
                item.is_favorite
                  ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                  : theme === "dark"
                  ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  : "border-stone-300 text-stone-700 hover:bg-stone-100"
              }`}
            >
              <Heart className={`w-4 h-4 ${item.is_favorite ? "fill-current" : ""}`} />
            </Button>
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              variant="outline"
              size="icon"
              className={`rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 ${
                theme === "dark" 
                  ? "border-zinc-700 text-zinc-300" 
                  : "border-stone-300 text-stone-700"
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Favorite Badge */}
      {item.is_favorite && (
        <div className="absolute top-3 right-3">
          <div className="p-2 rounded-xl bg-red-500">
            <Heart className="w-4 h-4 fill-white text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
}