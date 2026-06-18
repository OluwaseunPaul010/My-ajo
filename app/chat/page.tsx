"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Users, Wallet, TrendingUp, Bell,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  MessageCircle, Send, SmilePlus, Paperclip,
  ChevronLeft, Phone, MoreVertical, Pin
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
  { icon: MessageCircle, label: "Messages", href: "/chat", active: true },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Shield, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    if (token) {
      fetch("/api/groups", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setGroups(data.groups);
            if (data.groups.length > 0) {
              setSelectedGroup(data.groups[0]);
            }
          }
        });
    }
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;
    fetchMessages();
    fetchPinnedAnnouncement();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    if (!token || !selectedGroup) return;
    try {
      const res = await fetch(`/api/messages?groupId=${selectedGroup.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch {
      console.error("Failed to fetch messages");
    }
  };

  const fetchPinnedAnnouncement = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    if (!token || !selectedGroup) return;
    try {
      const res = await fetch(`/api/announcements?groupId=${selectedGroup.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const pinned = data.announcements.find((a: any) => a.isPinned);
        setPinnedAnnouncement(pinned || null);
      }
    } catch {
      console.error("Failed to fetch announcements");
    }
  };

  const handleSelectGroup = (group: any) => {
    setSelectedGroup(group);
    setMessages([]);
    setShowChat(true);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedGroup || sending) return;
    setSending(true);
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupId: selectedGroup.id, text: newMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage("");
      }
    } catch {
      console.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* App Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-sm transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">My <span className="text-emerald-500">Ajo</span></span>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active ? "bg-emerald-500 text-white" : "text-gray-600 hover:bg-gray-50 hover:text-emerald-500"}`}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </a>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-100">
            <a href="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors group">
              <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.fullName?.split(" ").map((n: string) => n[0]).join("") || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || "User"}</div>
                <div className="text-xs text-emerald-500">View Profile</div>
              </div>
            </a>
            <button
              onClick={() => {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                document.cookie = "token=; path=/; max-age=0";
                window.location.href = "/auth/login";
              }}
              className="w-full mt-2 flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-40 lg:hidden" />
      )}

      {/* Chat Area */}
      <div className="flex-1 flex min-w-0 h-screen">

        {/* Groups List Panel */}
        <div className={`${showChat ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-col bg-white border-r border-gray-100`}>
          {/* Groups Header */}
          <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Group Messages</h1>
          </div>

          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">Chat with your savings groups</p>
          </div>

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase px-2 mb-2">My Groups</p>
              {groups.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                  <p className="text-sm">No groups yet</p>
                  <a href="/groups" className="text-xs text-emerald-500 hover:underline">Join a group →</a>
                </div>
              ) : (
                groups.map((group: any, i: number) => (
                  <button key={i}
                    onClick={() => handleSelectGroup(group)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${selectedGroup?.id === group.id ? "bg-emerald-50 border border-emerald-100" : "hover:bg-gray-50"}`}>
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${selectedGroup?.id === group.id ? "bg-emerald-500" : "bg-emerald-400"}`}>
                        {group.name?.charAt(0)}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{group.name}</div>
                      <div className="text-xs text-gray-400">{group.frequency} · ₦{group.contribution?.toLocaleString()}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className={`${showChat ? "flex" : "hidden md:flex"} flex-1 flex-col h-screen min-w-0`}>
          {!selectedGroup ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-400">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-emerald-300" />
                <p className="font-medium text-gray-500">Select a group to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowChat(false)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedGroup.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900">{selectedGroup.name}</div>
                  <div className="text-xs text-gray-400">{selectedGroup.members?.length || 1} members · {selectedGroup.frequency}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Pinned Announcement */}
              {pinnedAnnouncement && (
                <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                  <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-700 truncate">
                    <span className="font-semibold">Pinned: </span>{pinnedAnnouncement.message}
                  </p>
                </div>
              )}

              {/* Messages - Fixed height, internal scroll */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
                style={{ minHeight: 0 }}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
                    <MessageCircle className="w-16 h-16 mb-4 text-emerald-300" />
                    <p className="font-medium text-gray-500">No messages yet</p>
                    <p className="text-sm mt-1">Be the first to say something! 👋</p>
                  </div>
                ) : (
                  messages.map((msg: any, i: number) => {
                    const isMe = msg.senderId === user?.id;
                    const showAvatar = !isMe && (i === 0 || messages[i - 1]?.senderId !== msg.senderId);
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        {!isMe && (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${showAvatar ? "bg-emerald-400" : "opacity-0"}`}>
                            {msg.sender?.fullName?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                          {showAvatar && !isMe && (
                            <span className="text-xs text-gray-400 mb-1 ml-1">{msg.sender?.fullName}</span>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe
                            ? "bg-emerald-500 text-white rounded-br-sm"
                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"}`}>
                            {msg.text}
                          </div>
                          <span className="text-xs text-gray-400 mt-1 mx-1">
                            {new Date(msg.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input - Always at bottom */}
              <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                <button className="p-2 text-gray-400 hover:text-emerald-500 transition-colors flex-shrink-0">
                  <SmilePlus className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-emerald-500 transition-colors flex-shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 min-w-0"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}