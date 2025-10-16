
import React, { useState } from "react";
import { api } from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../ThemeContext"; // Changed import path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AddFriendDialog({ open, onClose }) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [friendEmail, setFriendEmail] = useState("");
  const [friendName, setFriendName] = useState("");

  const addFriendMutation = useMutation({
    mutationFn: (data) => api.entities.Friendship.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      onClose();
      setFriendEmail("");
      setFriendName("");
    },
  });

  const handleSubmit = () => {
    if (!friendEmail.trim() || !friendName.trim()) return;
    addFriendMutation.mutate({
      friend_email: friendEmail,
      friend_name: friendName,
      status: "accepted",
    });
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
            Add Friend
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="friend-name" className={`text-base mb-2 block ${
              theme === "dark" ? "text-zinc-300" : "text-stone-700"
            }`}>
              Friend's Name
            </Label>
            <Input
              id="friend-name"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="e.g., John Doe"
              className={`h-12 rounded-xl ${
                theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-stone-50 border-stone-200 text-black"
              }`}
            />
          </div>

          <div>
            <Label htmlFor="friend-email" className={`text-base mb-2 block ${
              theme === "dark" ? "text-zinc-300" : "text-stone-700"
            }`}>
              Friend's Email
            </Label>
            <Input
              id="friend-email"
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="friend@example.com"
              className={`h-12 rounded-xl ${
                theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-stone-50 border-stone-200 text-black"
              }`}
            />
          </div>

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
              disabled={!friendEmail.trim() || !friendName.trim() || addFriendMutation.isPending}
              className={`flex-1 h-12 rounded-xl ${
                theme === "dark"
                  ? "bg-white text-black hover:bg-zinc-100"
                  : "bg-black text-white hover:bg-stone-900"
              }`}
            >
              {addFriendMutation.isPending ? "Adding..." : "Add Friend"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
