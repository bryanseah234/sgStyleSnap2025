
import React from "react";
import { useTheme } from "../ThemeContext"; // Changed path as per instructions
import { motion } from "framer-motion";

const categories = [
  { id: "all", label: "All Items" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Accessories" },
  { id: "outerwear", label: "Outerwear" },
];

export default function CategoryFilter({ activeCategory, setActiveCategory }) {
  const { theme } = useTheme();

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => setActiveCategory(category.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
            activeCategory === category.id
              ? theme === "dark"
                ? "bg-white text-black"
                : "bg-black text-white"
              : theme === "dark"
              ? "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              : "bg-white text-stone-600 hover:text-black border border-stone-200"
          }`}
        >
          {category.label}
        </motion.button>
      ))}
    </div>
  );
}
