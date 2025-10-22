import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../components/ThemeContext";
import { motion } from "framer-motion";
import { UserPlus, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import FriendCard from "../components/friends/FriendCard";
import AddFriendDialog from "../components/friends/AddFriendDialog";
import FriendRequestCard from "../components/friends/FriendRequestCard";

export default function Friends() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("friends");

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

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ["friend-requests", currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const allFriendships = await base44.entities.Friendship.list("-created_date");
      return allFriendships.filter(
        friendship => friendship.friend_email === currentUser.email && friendship.status === "pending"
      );
    },
    enabled: !!currentUser?.email,
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async ({ requestId, requesterEmail, requesterName }) => {
      await base44.entities.Friendship.update(requestId, { status: "accepted" });
      await base44.entities.Friendship.create({
        friend_email: requesterEmail,
        friend_name: requesterName,
        status: "accepted",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const declineRequestMutation = useMutation({
    mutationFn: (requestId) => base44.entities.Friendship.update(requestId, { status: "declined" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const filteredFriends = friendships.filter((friend) =>
    friend.friend_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-6 md:p-12 ${
      theme === "dark" ? "bg-black" : "bg-stone-50"
    }`}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-2 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}>
              Friends
            </h1>
            <p className={`text-lg ${
              theme === "dark" ? "text-zinc-400" : "text-stone-600"
            }`}>
              Connect and get inspired by others
            </p>
          </div>

          <Button
            onClick={() => setShowAddFriend(true)}
            className={`gap-2 ${
              theme === "dark"
                ? "bg-white text-black hover:bg-zinc-100"
                : "bg-black text-white hover:bg-stone-900"
            }`}
          >
            <UserPlus className="w-5 h-5" />
            Add Friend
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <Button
            onClick={() => setActiveTab("friends")}
            variant={activeTab === "friends" ? "default" : "outline"}
            className={`rounded-full ${
              activeTab === "friends"
                ? theme === "dark"
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : theme === "dark"
                ? "border-zinc-700 text-zinc-400"
                : "border-stone-300 text-stone-600"
            }`}
          >
            My Friends
          </Button>
          <Button
            onClick={() => setActiveTab("requests")}
            variant={activeTab === "requests" ? "default" : "outline"}
            className={`rounded-full gap-2 ${
              activeTab === "requests"
                ? theme === "dark"
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : theme === "dark"
                ? "border-zinc-700 text-zinc-400"
                : "border-stone-300 text-stone-600"
            }`}
          >
            <Bell className="w-4 h-4" />
            Friend Requests
            {incomingRequests.length > 0 && (
              <Badge className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                {incomingRequests.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Search (only for friends tab) */}
        {activeTab === "friends" && (
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              theme === "dark" ? "text-zinc-500" : "text-stone-400"
            }`} />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-12 h-14 rounded-2xl text-lg ${
                theme === "dark"
                  ? "bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                  : "bg-white border-stone-200 text-black placeholder:text-stone-400"
              }`}
            />
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="max-w-6xl mx-auto">
        {activeTab === "friends" ? (
          // Friends Grid
          filteredFriends.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-24 rounded-3xl ${
                theme === "dark"
                  ? "bg-zinc-900 border border-zinc-800"
                  : "bg-white border border-stone-200"
              }`}
            >
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${
                theme === "dark" ? "bg-zinc-800" : "bg-stone-100"
              } flex items-center justify-center`}>
                <UserPlus className={`w-12 h-12 ${
                  theme === "dark" ? "text-zinc-600" : "text-stone-400"
                }`} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}>
                {searchQuery ? "No friends found" : "No friends yet"}
              </h3>
              <p className={`text-lg mb-6 ${
                theme === "dark" ? "text-zinc-400" : "text-stone-600"
              }`}>
                {searchQuery 
                  ? "Try a different search term"
                  : "Start connecting with other fashion enthusiasts"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowAddFriend(true)}
                  className={`gap-2 ${
                    theme === "dark"
                      ? "bg-white text-black hover:bg-zinc-100"
                      : "bg-black text-white hover:bg-stone-900"
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  Add Your First Friend
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFriends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          )
        ) : (
          // Friend Requests
          incomingRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-24 rounded-3xl ${
                theme === "dark"
                  ? "bg-zinc-900 border border-zinc-800"
                  : "bg-white border border-stone-200"
              }`}
            >
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${
                theme === "dark" ? "bg-zinc-800" : "bg-stone-100"
              } flex items-center justify-center`}>
                <Bell className={`w-12 h-12 ${
                  theme === "dark" ? "text-zinc-600" : "text-stone-400"
                }`} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}>
                No pending requests
              </h3>
              <p className={`text-lg ${
                theme === "dark" ? "text-zinc-400" : "text-stone-600"
              }`}>
                You're all caught up!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  currentUser={currentUser}
                  onAccept={() => {
                    const requesterData = {
                      requestId: request.id,
                      requesterEmail: request.created_by,
                      requesterName: request.friend_name,
                    };
                    acceptRequestMutation.mutate(requesterData);
                  }}
                  onDecline={() => declineRequestMutation.mutate(request.id)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Add Friend Dialog */}
      <AddFriendDialog
        open={showAddFriend}
        onClose={() => setShowAddFriend(false)}
      />
    </div>
  );
}