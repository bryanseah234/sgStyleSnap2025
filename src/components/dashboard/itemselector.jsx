
import React, { useState } from "react";
import { useTheme } from "../ThemeContext"; // Changed import path
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function ItemSelector({ items, onSelectItem }) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState("all");

  const categories = ["all", "tops", "bottoms", "shoes", "accessories", "outerwear"];
  
  const filteredItems = filter === "all" 
    ? items 
    : items.filter((item) => item.category === filter);

  return (
    <div className={`rounded-3xl p-6 ${
      theme === "dark"
        ? "bg-zinc-900 border border-zinc-800"
        : "bg-white border border-stone-200"
    }`}>
      <h3 className={`text-xl font-bold mb-4 ${
        theme === "dark" ? "text-white" : "text-black"
      }`}>
        Your Items
      </h3>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              filter === cat
                ? theme === "dark"
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : theme === "dark"
                ? "bg-zinc-800 text-zinc-400 hover:text-white"
                : "bg-stone-100 text-stone-600 hover:text-black"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <p className={`text-center py-8 ${
            theme === "dark" ? "text-zinc-500" : "text-stone-400"
          }`}>
            No items in this category
          </p>
        ) : (
          filteredItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectItem(item)}
              className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                theme === "dark"
                  ? "bg-zinc-800 hover:bg-zinc-700"
                  : "bg-stone-100 hover:bg-stone-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                  theme === "dark" ? "bg-zinc-900" : "bg-white"
                }`}>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium truncate ${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}>
                    {item.name}
                  </h4>
                  <p className={`text-sm truncate ${
                    theme === "dark" ? "text-zinc-400" : "text-stone-600"
                  }`}>
                    {item.category}
                  </p>
                </div>
                <Plus className={`w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                  theme === "dark" ? "text-zinc-400" : "text-stone-600"
                }`} />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
