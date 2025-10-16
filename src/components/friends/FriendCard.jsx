import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTheme } from "../ThemeContext";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FriendCard({ friend }) {
  const { theme } = useTheme();

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className={`p-6 rounded-3xl ${
        theme === "dark"
          ? "bg-zinc-900 border border-zinc-800"
          : "bg-white border border-stone-200"
      } transition-all duration-300 group`}
    >
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className={`w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-bold ${
          theme === "dark" ? "bg-zinc-800 text-white" : "bg-stone-100 text-black"
        }`}>
          {friend.friend_name[0].toUpperCase()}
        </div>

        {/* Name */}
        <h3 className={`text-xl font-bold mb-1 ${
          theme === "dark" ? "text-white" : "text-black"
        }`}>
          {friend.friend_name}
        </h3>

        {/* Email */}
        <p className={`text-sm mb-4 ${
          theme === "dark" ? "text-zinc-400" : "text-stone-600"
        }`}>
          {friend.friend_email}
        </p>

        {/* View Cabinet Button */}
        <Link 
          to={`${createPageUrl("FriendCabinet")}?email=${encodeURIComponent(friend.friend_email)}&name=${encodeURIComponent(friend.friend_name)}`}
          className="w-full"
        >
          <Button
            className={`w-full gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
              theme === "dark"
                ? "bg-white text-black hover:bg-zinc-100"
                : "bg-black text-white hover:bg-stone-900"
            }`}
          >
            <Eye className="w-4 h-4" />
            View Cabinet
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}