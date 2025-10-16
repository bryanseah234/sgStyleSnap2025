
import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useTheme } from "../components/ThemeContext"; // Corrected import path for useTheme
import { motion } from "framer-motion";
import { Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Profile() {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    gender: "",
    profile_image: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await api.auth.me();
        setUser(userData);
        setFormData({
          full_name: userData.full_name || "",
          bio: userData.bio || "",
          gender: userData.gender || "",
          profile_image: userData.profile_image || "",
        });
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.auth.updateMe(formData);
      const updatedUser = await api.auth.me();
      setUser(updatedUser);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_image: file_url });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className={`w-12 h-12 border-4 rounded-full ${
            theme === "dark"
              ? "border-zinc-700 border-t-white"
              : "border-stone-200 border-t-black"
          }`}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-2 ${
            theme === "dark" ? "text-white" : "text-black"
          }`}>
            Profile Settings
          </h1>
          <p className={`text-lg ${
            theme === "dark" ? "text-zinc-400" : "text-stone-600"
          }`}>
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-8 rounded-3xl ${
            theme === "dark"
              ? "bg-zinc-900 border border-zinc-800"
              : "bg-white border border-stone-200"
          }`}
        >
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full overflow-hidden ${
                theme === "dark" ? "bg-zinc-800" : "bg-stone-100"
              }`}>
                {formData.profile_image ? (
                  <img
                    src={formData.profile_image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold">
                    {formData.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <label
                htmlFor="profile-image"
                className={`absolute inset-0 rounded-full ${
                  theme === "dark" ? "bg-black" : "bg-white"
                } bg-opacity-0 group-hover:bg-opacity-70 flex items-center justify-center cursor-pointer transition-all duration-300`}
              >
                <Camera className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="full_name" className={`text-base mb-2 block ${
                theme === "dark" ? "text-zinc-300" : "text-stone-700"
              }`}>
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={`h-12 rounded-xl ${
                  theme === "dark"
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-stone-50 border-stone-200 text-black"
                }`}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <Label className={`text-base mb-2 block ${
                theme === "dark" ? "text-zinc-300" : "text-stone-700"
              }`}>
                Email
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className={`h-12 rounded-xl ${
                  theme === "dark"
                    ? "bg-zinc-800 border-zinc-700 text-zinc-500"
                    : "bg-stone-50 border-stone-200 text-stone-500"
                }`}
              />
            </div>

            {/* Gender */}
            <div>
              <Label className={`text-base mb-2 block ${
                theme === "dark" ? "text-zinc-300" : "text-stone-700"
              }`}>
                Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger className={`h-12 rounded-xl ${
                  theme === "dark"
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-stone-50 border-stone-200 text-black"
                }`}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className={`text-base mb-2 block ${
                theme === "dark" ? "text-zinc-300" : "text-stone-700"
              }`}>
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about your style..."
                className={`min-h-32 rounded-xl ${
                  theme === "dark"
                    ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    : "bg-stone-50 border-stone-200 text-black placeholder:text-stone-400"
                }`}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className={`w-full h-12 rounded-xl gap-2 ${
                theme === "dark"
                  ? "bg-white text-black hover:bg-zinc-100"
                  : "bg-black text-white hover:bg-stone-900"
              }`}
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
