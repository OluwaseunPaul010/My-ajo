"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  Clock, CheckCircle, AlertCircle, Calendar, Zap
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

const reminders: any[] = [];

export default function RemindersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [dismissed, setDismissed] = useState<number[]>([]);

  const filtered = reminders.filter(r => {
    if (dismissed.includes(r.id)) return false;
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-500 border-emerald-200",
    amber: "bg-amber-50 text-amber-500 border-amber-200",
    blue: "bg-blue-50 text-blue-500 border-blue-200",
    purple: "bg-purple-50 text-purple-500 border-purple-200",
    red: "bg-red-50 text-red-500 border-red-200",
  };

  const badgeMap: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-600",
    upcoming: "bg-amber-100 text-amber-600",
    missed: "bg-red-100 text-red-600",
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Reminders</h1>
            <p className="text-sm text-gray-500">Stay on top of your contributions and payouts</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Active Reminders", value: "2", icon: Bell, color: "bg-emerald-100 text-emerald-500" },
              { label: "Upcoming", value: "3", icon: Clock, color: "bg-amber-50 text-amber-500" },
              { label: "Missed", value: "1", icon: AlertCircle, color: "bg-red-50 text-red-500" },
            ].map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {["all", "active", "upcoming", "missed"].map((tab) => (
              <button key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Reminders List */}
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No reminders in this category.</p>
              </div>
            )}
            {filtered.map((reminder, i) => (
              <motion.div key={reminder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white rounded-2xl p-5 border shadow-sm ${reminder.urgent ? "border-l-4 border-l-red-400 border-gray-100" : "border-gray-100"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMap[reminder.color]}`}>
                    <reminder.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{reminder.title}</h3>
                      {reminder.urgent && (
                        <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-medium">Urgent</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${badgeMap[reminder.status]}`}>
                        {reminder.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{reminder.group}</p>
                    <p className="text-sm text-gray-600">{reminder.desc}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-400">{reminder.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                  {reminder.type === "contribution" && (
                    <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-sm font-medium transition-colors">
                      Pay Now
                    </button>
                  )}
                  {reminder.type === "payout" && (
                    <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-sm font-medium transition-colors">
                      View Details
                    </button>
                  )}
                  {reminder.type === "deadline" && (
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl text-sm font-medium transition-colors">
                      Pay Now
                    </button>
                  )}
                  {reminder.type === "missed" && (
                    <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-medium transition-colors">
                      Resolve Now
                    </button>
                  )}
                  <button
                    onClick={() => setDismissed([...dismissed, reminder.id])}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                    Dismiss
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}