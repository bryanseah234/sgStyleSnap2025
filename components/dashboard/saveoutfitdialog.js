
import React, { useState } from "react";
import { useTheme } from "../ThemeContext"; // Changed import path from "../../contexts/ThemeContext" to "../ThemeContext"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SaveOutfitDialog({ open, onClose, canvasItems, onSave }) {
  const { theme } = useTheme();
  const [outfitName, setOutfitName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!outfitName.trim()) return;
    
    setSaving(true);
    try {
      await onSave(outfitName);
      setOutfitName("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-md ${
        theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-stone-200"
      }`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-black"
          }`}>
            Save Outfit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="outfit-name" className={`text-base mb-2 block ${
              theme === "dark" ? "text-zinc-300" : "text-stone-700"
            }`}>
              Outfit Name
            </Label>
            <Input
              id="outfit-name"
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              placeholder="e.g., Summer Casual"
              className={`h-12 rounded-xl ${
                theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-stone-50 border-stone-200 text-black"
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!outfitName.trim() || saving}
              className={`flex-1 h-12 rounded-xl ${
                theme === "dark"
                  ? "bg-white text-black hover:bg-zinc-100"
                  : "bg-black text-white hover:bg-stone-900"
              }`}
            >
              {saving ? "Saving..." : "Save Outfit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
