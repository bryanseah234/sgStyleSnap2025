import React, { useState } from "react";
import { api } from "@/api/client";
import { useTheme } from "../ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function UploadItemModal({ open, onClose }) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    image_url: "",
  });
  const [uploading, setUploading] = useState(false);

  const categories = [
    "tops",
    "bottoms", 
    "shoes",
    "accessories",
    "outerwear"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.image_url) return;

    setUploading(true);
    try {
      await api.entities.ClothingItem.create({
        ...formData,
        created_by: "test@example.com", // This would come from auth context
        is_favorite: false
      });
      
      setFormData({ name: "", category: "", image_url: "" });
      onClose();
    } catch (error) {
      console.error("Error uploading item:", error);
    } finally {
      setUploading(false);
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
            Upload New Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="item-name" className={`text-base mb-2 block ${
              theme === "dark" ? "text-zinc-300" : "text-stone-700"
            }`}>
              Item Name
            </Label>
            <Input
              id="item-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Blue Jeans"
              className={`h-12 rounded-xl ${
                theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-stone-50 border-stone-200 text-black"
              }`}
            />
          </div>

          <div>
            <Label htmlFor="category" className={`text-base mb-2 block ${
              theme === "dark" ? "text-zinc-300" : "text-stone-700"
            }`}>
              Category
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className={`h-12 rounded-xl ${
                theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-stone-50 border-stone-200 text-black"
              }`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image-url" className={`text-base mb-2 block ${
              theme === "dark" ? "text-zinc-300" : "text-stone-700"
            }`}>
              Image URL
            </Label>
            <Input
              id="image-url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className={`h-12 rounded-xl ${
                theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-stone-50 border-stone-200 text-black"
              }`}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name || !formData.category || !formData.image_url || uploading}
              className={`flex-1 h-12 rounded-xl ${
                theme === "dark"
                  ? "bg-white text-black hover:bg-zinc-100"
                  : "bg-black text-white hover:bg-stone-900"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
