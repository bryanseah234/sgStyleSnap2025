
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../components/ThemeContext"; // Corrected import path for useTheme
import { motion } from "framer-motion";
import { Camera, Save, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
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
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'success', 'error', 'up-to-date'
  const [syncDetails, setSyncDetails] = useState(null); // Detailed sync information
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    gender: "",
    profile_image: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
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
      await base44.auth.updateMe(formData);
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSyncWithGoogle = async () => {
    setSyncing(true);
    setSyncStatus(null);
    setSyncDetails(null);
    
    try {
      const result = await base44.auth.syncProfileWithGoogle();
      
      if (result?.success) {
        setSyncDetails(result);
        if (result.profile_updated) {
          setSyncStatus('success');
          // Reload user data to show updated profile
          const updatedUser = await base44.auth.me();
          setUser(updatedUser);
          setFormData({
            full_name: updatedUser.full_name || "",
            bio: updatedUser.bio || "",
            gender: updatedUser.gender || "",
            profile_image: updatedUser.profile_image || "",
          });
        } else {
          setSyncStatus('up-to-date');
        }
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error("Error syncing with Google:", error);
      setSyncStatus('error');
    } finally {
      setSyncing(false);
      // Clear status after 5 seconds to allow users to read details
      setTimeout(() => {
        setSyncStatus(null);
        setSyncDetails(null);
      }, 5000);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_image: file_url });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-black" : "bg-stone-50"
      }`}>
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
    <div className={`min-h-screen p-6 md:p-12 ${
      theme === "dark" ? "bg-black" : "bg-stone-50"
    }`}>
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

          {/* Google Profile Sync Section */}
          <div className={`mb-8 p-6 rounded-2xl ${
            theme === "dark" ? "bg-zinc-800 border border-zinc-700" : "bg-stone-50 border border-stone-200"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-semibold ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}>
                  Google Profile Sync
                </h3>
                <p className={`text-sm ${
                  theme === "dark" ? "text-zinc-400" : "text-stone-600"
                }`}>
                  Keep your profile photo synchronized with your Google account
                </p>
              </div>
              <Button
                onClick={handleSyncWithGoogle}
                disabled={syncing}
                variant="outline"
                className={`h-10 px-4 rounded-lg gap-2 ${
                  theme === "dark"
                    ? "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                    : "border-stone-300 text-stone-700 hover:bg-stone-100"
                }`}
              >
                {syncing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Sync with Google
                  </>
                )}
              </Button>
            </div>

            {/* Sync Status */}
            {syncStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  syncStatus === 'success' 
                    ? theme === "dark" ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-200"
                    : syncStatus === 'error'
                    ? theme === "dark" ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"
                    : theme === "dark" ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {syncStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {syncStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  {syncStatus === 'up-to-date' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  <span className={`text-sm font-medium ${
                    syncStatus === 'success' 
                      ? "text-green-700 dark:text-green-300"
                      : syncStatus === 'error'
                      ? "text-red-700 dark:text-red-300"
                      : "text-blue-700 dark:text-blue-300"
                  }`}>
                    {syncStatus === 'success' && "Profile synchronized successfully!"}
                    {syncStatus === 'error' && "Failed to sync profile. Please try again."}
                    {syncStatus === 'up-to-date' && "Profile is already up-to-date."}
                  </span>
                </div>
                
                {/* Detailed sync information */}
                {syncDetails && (
                  <div className={`text-xs space-y-1 ${
                    theme === "dark" ? "text-zinc-400" : "text-stone-600"
                  }`}>
                    <div className="font-medium">Sync Details:</div>
                    <div>{syncDetails.changes_summary}</div>
                    
                    {syncDetails.google_data && (
                      <div className="mt-2">
                        <div className="font-medium mb-1">Google Profile Data:</div>
                        <div className="space-y-1">
                          {syncDetails.google_data.name && (
                            <div>Name: {syncDetails.google_data.name}</div>
                          )}
                          {syncDetails.google_data.email && (
                            <div>Email: {syncDetails.google_data.email}</div>
                          )}
                          {syncDetails.google_data.avatar_url && (
                            <div>Avatar: {syncDetails.google_data.avatar_url.substring(0, 50)}...</div>
                          )}
                          {syncDetails.google_data.locale && (
                            <div>Locale: {syncDetails.google_data.locale}</div>
                          )}
                          {syncDetails.google_data.verified_email !== undefined && (
                            <div>Email Verified: {syncDetails.google_data.verified_email ? 'Yes' : 'No'}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
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
