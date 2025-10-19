import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../components/ThemeContext.js";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Save,
  Trash2,
  Grid3x3,
  Undo,
  Redo,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import OutfitCanvas from "../components/dashboard/OutfitCanvas";
import ItemSelector from "../components/dashboard/ItemSelector";
import SaveOutfitDialog from "../components/dashboard/saveoutfitdialog.js";

export default function Dashboard() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const canvasRef = useRef(null);
  const location = useLocation();

  const [canvasItems, setCanvasItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedOwner, setSelectedOwner] = useState("me");
  const [currentUser, setCurrentUser] = useState(null);

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

  const { data: items = [] } = useQuery({
    queryKey: ["clothing-items-dashboard", selectedOwner, currentUser?.email],
    queryFn: () => {
      if (selectedOwner === "me") {
        if (!currentUser?.email) return [];
        return base44.entities.ClothingItem.filter(
          { created_by: currentUser.email },
          "-created_date"
        );
      } else {
        return base44.entities.ClothingItem.filter(
          { created_by: selectedOwner },
          "-created_date"
        );
      }
    },
    enabled: !!currentUser?.email,
  });

  const { data: friendships = [] } = useQuery({
    queryKey: ["friendships", currentUser?.email],
    queryFn: () => {
      if (!currentUser?.email) return [];
      return base44.entities.Friendship.filter(
        { created_by: currentUser.email, status: "accepted" },
        "-created_date"
      );
    },
    enabled: !!currentUser?.email,
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ["all-clothing-items"],
    queryFn: () => base44.entities.ClothingItem.list("-created_date"),
  });

  const saveOutfitMutation = useMutation({
    mutationFn: (outfitData) => base44.entities.Outfit.create(outfitData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      setShowSaveDialog(false);
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const outfitId = urlParams.get("outfit");

    if (outfitId && currentUser?.email && allItems.length > 0) {
      loadOutfit(outfitId);
    }
  }, [location.search, currentUser, allItems]);

  const loadOutfit = async (outfitId) => {
    try {
      const allOutfits = await base44.entities.Outfit.list();
      const outfit = allOutfits.find(o => o.id === outfitId);

      if (outfit && outfit.items) {
        const loadedItems = outfit.items.map(savedItem => {
          const fullItem = allItems.find(i => i.id === savedItem.item_id);
          return {
            ...savedItem,
            item: fullItem || { id: savedItem.item_id, name: "Unknown Item", image_url: "" }
          };
        });

        setCanvasItems(loadedItems);
        addToHistory(loadedItems);
      }
    } catch (error) {
      console.error("Error loading outfit:", error);
    }
  };

  const addToCanvas = (item) => {
    const newItem = {
      id: Date.now().toString(),
      item_id: item.id,
      item,
      x: 300,
      y: 200,
      scale: 1,
      rotation: 0,
      z_index: canvasItems.length,
    };

    const newCanvasItems = [...canvasItems, newItem];
    setCanvasItems(newCanvasItems);
    addToHistory(newCanvasItems);
  };

  const updateCanvasItem = (id, updates) => {
    const newCanvasItems = canvasItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setCanvasItems(newCanvasItems);
  };

  const removeCanvasItem = (id) => {
    const newCanvasItems = canvasItems.filter((item) => item.id !== id);
    setCanvasItems(newCanvasItems);
    addToHistory(newCanvasItems);
  };

  const clearCanvas = () => {
    setCanvasItems([]);
    setSelectedItemId(null);
    addToHistory([]);
  };

  const addToHistory = (state) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvasItems(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvasItems(history[historyIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <div>
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}>
              Outfits
            </h1>
            <p className={`text-base md:text-lg ${
              theme === "dark" ? "text-zinc-400" : "text-stone-600"
            }`}>
              Create and save your perfect looks
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button
              onClick={undo}
              disabled={historyIndex <= 0}
              variant="outline"
              size="icon"
              className="rounded-xl"
            >
              <Undo className="w-4 h-4" />
            </Button>

            <Button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              variant="outline"
              size="icon"
              className="rounded-xl"
            >
              <Redo className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => setShowGrid(!showGrid)}
              variant={showGrid ? "default" : "outline"}
              size="icon"
              className="rounded-xl"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>

            <Button
              onClick={clearCanvas}
              variant="outline"
              className="gap-2 rounded-xl text-sm md:text-base"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>

            <Button
              onClick={() => setShowSaveDialog(true)}
              disabled={canvasItems.length === 0}
              className={`gap-2 rounded-xl flex-1 md:flex-none text-sm md:text-base ${
                theme === "dark"
                  ? "bg-white text-black hover:bg-zinc-100"
                  : "bg-black text-white hover:bg-stone-900"
              }`}
            >
              <Save className="w-4 h-4" />
              Save Outfit
            </Button>
          </div>
        </div>

        {/* Cabinet Selector */}
        <div className="mt-4 md:mt-6">
          <div className={`inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-sm md:text-base ${
            theme === "dark" ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-stone-200"
          }`}>
            <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
            <span className={`font-medium ${theme === "dark" ? "text-zinc-300" : "text-stone-700"}`}>
              Items from:
            </span>
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger className={`w-36 md:w-48 ${
                theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-stone-50 border-stone-200"
              }`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="me">My Cabinet</SelectItem>
                {friendships.map((friend) => (
                  <SelectItem key={friend.id} value={friend.friend_email}>
                    {friend.friend_name}'s Cabinet
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Item Selector Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <ItemSelector items={items} onSelectItem={addToCanvas} />
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <OutfitCanvas
            ref={canvasRef}
            items={canvasItems}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            updateItem={updateCanvasItem}
            removeItem={removeCanvasItem}
            showGrid={showGrid}
          />
        </div>
      </div>

      {/* Save Dialog */}
      <SaveOutfitDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        canvasItems={canvasItems}
        onSave={(name) => {
          saveOutfitMutation.mutate({
            name,
            items: canvasItems.map(({ item, ...rest }) => rest),
          });
        }}
      />
    </div>
  );
}