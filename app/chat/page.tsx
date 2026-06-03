"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  Send, Phone, MoreVertical, Pin, Smile, Paperclip,
  CheckCheck, Circle
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Reminders", href: "/reminders", badge: 2 },
  { icon: MessageCircle, label: "Messages", href: "/chat", active: true, badge: 3 },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Shield, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const messages = [
  { id: 1, sender: "Tunde Adeyemi", avatar: "TA", text: "Good morning everyone! 👋 Don't forget our contribution deadline is tomorrow.", time: "9:00 AM", isMe: false, reactions: ["❤️ 4"] },
  { id: 2, sender: "Me", avatar: "CO", text: "Thanks for the reminder Tunde! 🙏", time: "9:02 AM", isMe: true, read: true },
  { id: 3, sender: "Chioma Okafor", avatar: "CO", text: "I have made my contribution ✅", time: "9:05 AM", isMe: false, reactions: ["❤️ 3"] },
  { id: 4, sender: "Emeka Nwosu", avatar: "EN", text: "Same here ✅", time: "9:06 AM", isMe: false, reactions: ["❤️ 2"] },
  { id: 5, sender: "Adesola Bankole", avatar: "AB", text: "Will make mine by noon today 🕐", time: "9:10 AM", isMe: false },
  { id: 6, sender: "Me", avatar: "CO", text: "Great! Looking forward to this month's payout rotation 💰", time: "9:15 AM", isMe: true, read: true },
  { id: 7, sender: "Tunde Adeyemi", avatar: "TA", text: "Chioma your payout is coming up in 2 days! Exciting! 🎉", time: "9:20 AM", isMe: false, reactions: ["🎉 5"] },
  { id: 8, sender: "Me", avatar: "CO", text: "Yes! I can't wait 😊 Planning to invest it in my business.", time: "9:22 AM", isMe: true, read: false },
];

const groupChats = [
  { name: "Family Ajo", lastMsg: "Chioma your payout is coming...", time: "9:20 AM", unread: 3, online: 10 },
  { name: "Market Women Ajo", lastMsg: "Next contribution is on Friday", time: "Yesterday", unread: 0, online: 5 },
  { name: "Office Savings", lastMsg: "Admin: Welcome Emeka! 👋", time: "Mon", unread: 1, online: 2 },
];

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [activeChat, setActiveChat] = useState(0);
  const [chatMessages, setChatMessages] = useState(messages);

  const sendMessage = () => {
    if (!message.trim()) return;
    setChatMessages([...chatMessages, {
      id: chatMessages.length + 1,
      sender: "Me",
      avatar: "CO",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
      read: false,
    }]);
    setMessage("");
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
                {item.badge && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${item.active ? "bg-white text-emerald-500" : "bg-emerald-100 text-emerald-600"}`}>{item.badge}</span>
                )}
              </a>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">CO</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">Chioma Okafor</div>
                <div className="text-xs text-emerald-500">Premium Member</div>
              </div>
              <button
  onClick={() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

      {/* Main */}
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
          {/* Chat List */}
          <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-3">My Groups</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {groupChats.map((chat, i) => (
                <button key={i}
                  onClick={() => setActiveChat(i)}
                  className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left ${activeChat === i ? "bg-emerald-50 border-r-2 border-emerald-500" : ""}`}>
                  <div className="relative">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                      {chat.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">{chat.name}</span>
                      <span className="text-xs text-gray-400">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-gray-400 truncate">{chat.lastMsg}</span>
                      {chat.unread > 0 && (
                        <span className="ml-2 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-emerald-500 mt-0.5">{chat.online} members online</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                  {groupChats[activeChat].name.charAt(0)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{groupChats[activeChat].name}</div>
                <div className="text-xs text-emerald-500">{groupChats[activeChat].online} members online</div>
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
              <span className="text-xs text-emerald-600">Let&apos;s all make our contributions on time this week 💪</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : ""}`}>
                  {!msg.isMe && (
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-xs flex-shrink-0">
                      {msg.avatar}
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-md ${msg.isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    {!msg.isMe && (
                      <span className="text-xs text-gray-400 font-medium">{msg.sender}</span>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.isMe ? "bg-emerald-500 text-white rounded-tr-sm" : "bg-white text-gray-800 shadow-sm rounded-tl-sm"}`}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{msg.time}</span>
                      {msg.isMe && (
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? "text-emerald-500" : "text-gray-300"}`} />
                      )}
                    </div>
                    {msg.reactions && (
                      <div className="flex gap-1">
                        {msg.reactions.map((r, j) => (
                          <span key={j} className="text-xs bg-white shadow-sm px-2 py-0.5 rounded-full border border-gray-100">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Typing Indicator */}
            <div className="px-6 py-2">
              <div className="flex items-center gap-2">
                <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500" />
                <span className="text-xs text-gray-400">Tunde is typing...</span>
              </div>
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
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}