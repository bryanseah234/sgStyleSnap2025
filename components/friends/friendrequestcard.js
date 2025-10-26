import React from "react";
import { useTheme } from "../ThemeContext";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FriendRequestCard({ request, currentUser, onAccept, onDecline }) {
  const { theme } = useTheme();

  const getRequesterEmail = () => {
    return request.created_by;
  };

  const getRequesterName = () => {
    const requesterEmail = getRequesterEmail();
    const parts = requesterEmail.split('@')[0];
    return parts.charAt(0).toUpperCase() + parts.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-6 rounded-3xl ${
        theme === "dark"
          ? "bg-zinc-900 border border-zinc-800"
          : "bg-white border border-stone-200"
      } transition-all duration-300`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
            theme === "dark" ? "bg-zinc-800 text-white" : "bg-stone-100 text-black"
          }`}>
            {getRequesterName()[0].toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold mb-1 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}>
              {getRequesterName()}
            </h3>
            <p className={`text-sm truncate ${
              theme === "dark" ? "text-zinc-400" : "text-stone-600"
            }`}>
              {getRequesterEmail()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onAccept}
            size="icon"
            className="rounded-xl bg-green-500 hover:bg-green-600 text-white"
          >
            <Check className="w-5 h-5" />
          </Button>
          <Button
            onClick={onDecline}
            size="icon"
            variant="outline"
            className={`rounded-xl ${
              theme === "dark"
                ? "border-zinc-700 text-zinc-400 hover:bg-red-500 hover:text-white hover:border-red-500"
                : "border-stone-300 text-stone-600 hover:bg-red-500 hover:text-white hover:border-red-500"
            }`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}