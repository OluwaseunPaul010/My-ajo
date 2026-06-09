"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  Send, Phone, MoreVertical, Pin, Smile, Paperclip,
  CheckCheck
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
  { icon: MessageCircle, label: "Messages", href: "/chat" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Shield, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/groups", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.groups.length > 0) {
            setGroups(data.groups);
            setActiveGroup(data.groups[0]);
          }
        });
    }
  }, []);

  useEffect(() => {
    if (activeGroup) {
      fetchMessages();
      pollingRef.current = setInterval(fetchMessages, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    if (!activeGroup) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/messages?groupId=${activeGroup.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setMessages(data.messages);
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeGroup) return;
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId: activeGroup.id, text: message }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        setMessage("");
      }
    } catch {
      console.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
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
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.fullName?.split(" ").map((n: string) => n[0]).join("") || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || "User"}</div>
                <div className="text-xs text-emerald-500">Premium Member</div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  document.cookie = "token=; path=/; max-age=0";
                  window.location.href = "/auth/login";
                }}
                className="text-gray-400 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-40 lg:hidden" />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Group Messages</h1>
            <p className="text-sm text-gray-500">Chat with your savings groups</p>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Groups List */}
          <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">My Groups</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {groups.length === 0 ? (
                <div className="text-center py-12 px-4 text-gray-400">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                  <p className="text-sm font-medium text-gray-500">No groups yet</p>
                  <p className="text-xs mt-1">Join a group to start chatting!</p>
                  <a href="/groups" className="mt-3 inline-block text-xs text-emerald-500 font-medium hover:underline">
                    Browse Groups →
                  </a>
                </div>
              ) : (
                groups.map((group: any, i: number) => (
                  <button key={i}
                    onClick={() => setActiveGroup(group)}
                    className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left ${activeGroup?.id === group.id ? "bg-emerald-50 border-r-2 border-emerald-500" : ""}`}>
                    <div className="relative">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {group.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{group.name}</div>
                      <div className="text-xs text-gray-400 truncate">{group.frequency} · ₦{group.contribution?.toLocaleString()}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {!activeGroup ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-emerald-300" />
                  <p className="font-medium text-gray-500">Select a group to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                      {activeGroup.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{activeGroup.name}</div>
                    <div className="text-xs text-emerald-500">{activeGroup.members?.length || 1} members</div>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <button className="p-2 text-gray-400 hover:text-emerald-500 transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-emerald-500 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Pinned Message */}
                <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2 flex items-center gap-2">
                  <Pin className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">Pinned: </span>
                  <span className="text-xs text-emerald-600">Let&apos;s all make our contributions on time! 💪</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                      <p className="text-sm font-medium text-gray-500">No messages yet</p>
                      <p className="text-xs">Be the first to say something! 👋</p>
                    </div>
                  ) : (
                    messages.map((msg: any, i: number) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <motion.div key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                          {!isMe && (
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-xs flex-shrink-0">
                              {msg.sender?.fullName?.charAt(0) || "U"}
                            </div>
                          )}
                          <div className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                            {!isMe && (
                              <span className="text-xs text-gray-400 font-medium">{msg.sender?.fullName}</span>
                            )}
                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-emerald-500 text-white rounded-tr-sm" : "bg-white text-gray-800 shadow-sm rounded-tl-sm"}`}>
                              {msg.text}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-400">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-100 px-4 py-4">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                    <button className="text-gray-400 hover:text-emerald-500 transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-emerald-500 transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !message.trim()}
                      className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 rounded-xl flex items-center justify-center transition-colors">
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}