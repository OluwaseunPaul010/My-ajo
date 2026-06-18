"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  CheckCircle, AlertCircle, CreditCard, Users2,
  Gift, Activity, BarChart3, BellOff
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
  { icon: MessageCircle, label: "Messages", href: "/chat" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Gift, label: "Refer & Earn", href: "/referral" },
  { icon: Activity, label: "Activity Log", href: "/activity" },
  { icon: Shield, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const notifIcons: Record<string, any> = {
  payment: CreditCard,
  group: Users2,
  alert: AlertCircle,
  success: CheckCircle,
  default: Bell,
};

const notifColors: Record<string, string> = {
  payment: "bg-blue-50 text-blue-500",
  group: "bg-emerald-100 text-emerald-500",
  alert: "bg-red-50 text-red-400",
  success: "bg-emerald-100 text-emerald-500",
  default: "bg-gray-100 text-gray-500",
};

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }

    fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setNotifications(data.notifications);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Mark all as read when page opens
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  }, []);

  const filtered = filter === "all"
    ? notifications
    : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
          <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
            {navItems.map((item, i) => (
              <a key={i} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-600 hover:bg-gray-50 hover:text-emerald-500">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-100">
            <a href="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "U"}
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">All your account activity and alerts</p>
          </div>
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {unreadCount} new
            </span>
          )}
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total", value: notifications.length, color: "bg-gray-100 text-gray-500", icon: Bell },
              { label: "Unread", value: unreadCount, color: "bg-red-50 text-red-400", icon: AlertCircle },
              { label: "Payments", value: notifications.filter((n) => n.type === "payment").length, color: "bg-blue-50 text-blue-500", icon: CreditCard },
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

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { id: "all", label: "All" },
              { id: "payment", label: "Payments" },
              { id: "group", label: "Groups" },
              { id: "success", label: "Success" },
              { id: "alert", label: "Alerts" },
            ].map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f.id ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                {filter === "all" ? "All Notifications" : `${filter} Notifications`} ({filtered.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <BellOff className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                <p className="font-medium text-gray-500">No notifications yet</p>
                <p className="text-sm">Activity on your account will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((notif: any, i: number) => {
                  const Icon = notifIcons[notif.type] || notifIcons.default;
                  const color = notifColors[notif.type] || notifColors.default;
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${!notif.read ? "bg-emerald-50/30" : ""}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900">{notif.title}</span>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                        <span className="text-xs text-gray-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${color}`}>
                        {notif.type}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}