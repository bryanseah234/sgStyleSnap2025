
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../ThemeContext"; // Changed import path
import { motion } from "framer-motion";
import { X, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function UploadItemModal({ open, onClose }) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "",
    brand: "",
    image_url: "",
  });
  const [previewUrl, setPreviewUrl] = useState("");

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ClothingItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothing-items"] });
      onClose();
      resetForm();
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      setPreviewUrl(file_url);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.image_url) return;
    createMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      color: "",
      brand: "",
      image_url: "",
    });
    setPreviewUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${
        theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-stone-200"
      }`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-black"
          }`}>
            Upload New Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Image Upload */}
          <div>
            <Label className={`text-base mb-3 block ${
              theme === "dark" ? "text-zinc-300" : "text-stone-700"
            }`}>
              Item Image
            </Label>
            
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className={`w-full h-64 object-contain rounded-2xl ${
                    theme === "dark" ? "bg-zinc-800" : "bg-stone-100"
                  }`}
                />
                <Button
                  onClick={() => {
                    setPreviewUrl("");
                    setFormData({ ...formData, image_url: "" });
                  }}
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                  theme === "dark"
                    ? "border-zinc-700 hover:border-zinc-600 bg-zinc-800 hover:bg-zinc-750"
                    : "border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100"
                }`}
              >
                {uploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className={`w-12 h-12 border-4 rounded-full ${
                      theme === "dark"
                        ? "border-zinc-600 border-t-white"
                        : "border-stone-300 border-t-black"
                    }`}
                  />
                ) : (
                  <>
                    <Upload className={`w-12 h-12 mb-4 ${
                      theme === "dark" ? "text-zinc-500" : "text-stone-400"
                    }`} />
                    <p className={`text-lg font-medium ${
                      theme === "dark" ? "text-zinc-400" : "text-stone-600"
                    }`}>
                      Click to upload or drag and drop
                    </p>
                    <p className={`text-sm mt-2 ${
                      theme === "dark" ? "text-zinc-500" : "text-stone-500"
                    }`}>
                      PNG, JPG or JPEG
                    </p>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className={`text-base mb-2 block ${
                theme === "dark" ? "text-zinc-300" : "text-stone-700"
              }`}>
                Item Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Black T-Shirt"
                className={`h-12 rounded-xl ${
                  theme === "dark"
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-stone-50 border-stone-200 text-black"
                }`}
              />
            </div>

            <div>
              <Label className={`text-base mb-2 block ${
                theme === "dark" ? "text-zinc-300" : "text-stone-700"
              }`}>
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className={`h-12 rounded-xl ${
                  theme === "dark"
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-stone-50 border-stone-200 text-black"
                }`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tops">Tops</SelectItem>
                  <SelectItem value="bottoms">Bottoms</SelectItem>
                  <SelectItem value="shoes">Shoes</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="outerwear">Outerwear</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color" className={`text-base mb-2 block ${
                theme === "dark" ? "text-zinc-300" : "text-stone-700"
              }`}>
                Color
              </Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g., Black"
                className={`h-12 rounded-xl ${
                  theme === "dark"
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-stone-50 border-stone-200 text-black"
                }`}
              />
            </div>

            <div>
              <Label htmlFor="brand" className={`text-base mb-2 block ${
                theme === "dark" ? "text-zinc-300" : "text-stone-700"
              }`}>
                Brand
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., Nike"
                className={`h-12 rounded-xl ${
                  theme === "dark"
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-stone-50 border-stone-200 text-black"
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.category || !formData.image_url || createMutation.isPending}
              className={`flex-1 h-12 rounded-xl ${
                theme === "dark"
                  ? "bg-white text-black hover:bg-zinc-100"
                  : "bg-black text-white hover:bg-stone-900"
              }`}
            >
              {createMutation.isPending ? "Uploading..." : "Add Item"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
