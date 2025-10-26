import React, { forwardRef } from "react";
import { useTheme } from "../ThemeContext";
import { motion } from "framer-motion";
import { Trash2, RotateCw, ZoomIn, ZoomOut, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const OutfitCanvas = forwardRef(({ items, selectedItemId, setSelectedItemId, updateItem, removeItem, showGrid }, ref) => {
  const { theme } = useTheme();

  const handleDragEnd = (e, itemId) => {
    const bounds = e.target.getBoundingClientRect();
    const canvasBounds = e.target.parentElement.getBoundingClientRect();
    
    updateItem(itemId, {
      x: bounds.left - canvasBounds.left,
      y: bounds.top - canvasBounds.top,
    });
  };

  const bringForward = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const maxZIndex = Math.max(...items.map(i => i.z_index), 0);
    if (item.z_index < maxZIndex) {
      updateItem(itemId, { z_index: item.z_index + 1 });
      
      const affectedItem = items.find(i => i.z_index === item.z_index + 1 && i.id !== itemId);
      if (affectedItem) {
        updateItem(affectedItem.id, { z_index: affectedItem.z_index - 1 });
      }
    }
  };

  const sendBackward = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const minZIndex = Math.min(...items.map(i => i.z_index), 0);
    if (item.z_index > minZIndex) {
      updateItem(itemId, { z_index: item.z_index - 1 });
      
      const affectedItem = items.find(i => i.z_index === item.z_index - 1 && i.id !== itemId);
      if (affectedItem) {
        updateItem(affectedItem.id, { z_index: affectedItem.z_index + 1 });
      }
    }
  };

  return (
    <div
      ref={ref}
      className={`relative w-full aspect-[4/3] rounded-3xl overflow-hidden ${
        theme === "dark"
          ? "bg-zinc-900 border border-zinc-800"
          : "bg-white border border-stone-200"
      }`}
    >
      {/* Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(${theme === "dark" ? "#27272a" : "#e7e5e4"} 1px, transparent 1px),
              linear-gradient(90deg, ${theme === "dark" ? "#27272a" : "#e7e5e4"} 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full ${
              theme === "dark" ? "bg-zinc-800" : "bg-stone-100"
            } flex items-center justify-center`}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                ✨
              </motion.div>
            </div>
            <p className={`text-lg font-medium ${
              theme === "dark" ? "text-zinc-500" : "text-stone-400"
            }`}>
              Start adding items to create your outfit
            </p>
          </div>
        </div>
      )}

      {/* Canvas Items */}
      {items.map((canvasItem) => (
        <motion.div
          key={canvasItem.id}
          drag
          dragMomentum={false}
          onDragEnd={(e) => handleDragEnd(e, canvasItem.id)}
          onClick={() => setSelectedItemId(canvasItem.id)}
          initial={{ x: canvasItem.x, y: canvasItem.y }}
          animate={{
            x: canvasItem.x,
            y: canvasItem.y,
            scale: canvasItem.scale,
            rotate: canvasItem.rotation,
            zIndex: canvasItem.z_index,
          }}
          className={`absolute cursor-move ${
            selectedItemId === canvasItem.id ? "ring-2 ring-offset-2 ring-blue-500" : ""
          }`}
          style={{ width: "150px", height: "150px" }}
        >
          <img
            src={canvasItem.item.image_url}
            alt={canvasItem.item.name}
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Controls - Compact toolbar above selected item */}
          {selectedItemId === canvasItem.id && (
            <div className={`absolute -top-12 left-1/2 -translate-x-1/2 flex gap-0.5 p-1.5 rounded-lg ${
              theme === "dark" ? "bg-zinc-800/95 border border-zinc-700" : "bg-white/95 border border-stone-200"
            } shadow-lg backdrop-blur-sm`}>
              <Button
                size="icon"
                variant="ghost"
                className="rounded h-7 w-7 hover:bg-zinc-700"
                onClick={(e) => {
                  e.stopPropagation();
                  updateItem(canvasItem.id, {
                    scale: Math.max(0.5, canvasItem.scale - 0.1),
                  });
                }}
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="rounded h-7 w-7 hover:bg-zinc-700"
                onClick={(e) => {
                  e.stopPropagation();
                  updateItem(canvasItem.id, {
                    scale: Math.min(2, canvasItem.scale + 0.1),
                  });
                }}
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="rounded h-7 w-7 hover:bg-zinc-700"
                onClick={(e) => {
                  e.stopPropagation();
                  updateItem(canvasItem.id, {
                    rotation: (canvasItem.rotation + 15) % 360,
                  });
                }}
                title="Rotate"
              >
                <RotateCw className="w-3 h-3" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="rounded h-7 w-7 hover:bg-zinc-700"
                onClick={(e) => {
                  e.stopPropagation();
                  bringForward(canvasItem.id);
                }}
                title="Bring Forward"
              >
                <ArrowUp className="w-3 h-3" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="rounded h-7 w-7 hover:bg-zinc-700"
                onClick={(e) => {
                  e.stopPropagation();
                  sendBackward(canvasItem.id);
                }}
                title="Send Backward"
              >
                <ArrowDown className="w-3 h-3" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="rounded h-7 w-7 hover:bg-red-500 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(canvasItem.id);
                }}
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
});

OutfitCanvas.displayName = "OutfitCanvas";

export default OutfitCanvas;