"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  CheckCircle, AlertCircle, Zap, Clock
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

const iconMap: Record<string, any> = {
  payment: Zap,
  group: Users,
  reminder: Clock,
  alert: AlertCircle,
  success: CheckCircle,
};

const colorMap: Record<string, string> = {
  payment: "bg-emerald-100 text-emerald-500",
  group: "bg-blue-50 text-blue-500",
  reminder: "bg-amber-50 text-amber-500",
  alert: "bg-red-50 text-red-500",
  success: "bg-emerald-100 text-emerald-500",
};

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
          }
        });
    }
  }, []);

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-600 hover:bg-gray-50 hover:text-emerald-500">
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
                localStorage.removeItem("token");
                localStorage.removeItem("user");
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

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-40 lg:hidden" />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">Stay updated with your savings activity</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="ml-auto text-sm text-emerald-500 hover:text-emerald-600 font-medium">
              Mark all as read
            </button>
          )}
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Notifications", value: notifications.length, icon: Bell, color: "bg-emerald-100 text-emerald-500" },
              { label: "Unread", value: unreadCount, icon: AlertCircle, color: "bg-amber-50 text-amber-500" },
              { label: "Read", value: notifications.length - unreadCount, icon: CheckCircle, color: "bg-blue-50 text-blue-500" },
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

          {/* Notifications List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">All Notifications</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                  <p className="font-medium text-gray-600">No notifications yet!</p>
                  <p className="text-sm">We&apos;ll notify you about important activity.</p>
                </div>
              ) : (
                notifications.map((notif: any, i: number) => {
                  const Icon = iconMap[notif.type] || Bell;
                  const color = colorMap[notif.type] || "bg-emerald-100 text-emerald-500";
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${!notif.read ? "bg-emerald-50/30" : ""}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-gray-900">{notif.title}</div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">{notif.message}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric", month: "short",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </div>

                        {/* Action Buttons based on notification type */}
                        {notif.type === "group" && notif.title.includes("Join Request") && (
                          <a href="/groups"
                            className="mt-2 inline-flex items-center gap-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                            👉 Review Request in Groups
                          </a>
                        )}
                        {notif.type === "group" && notif.title.includes("Approved") && (
                          <a href="/groups"
                            className="mt-2 inline-flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg transition-colors font-medium">
                            🎉 View My Groups
                          </a>
                        )}
                        {notif.type === "payment" && (
                          <a href="/wallet"
                            className="mt-2 inline-flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg transition-colors font-medium">
                            💰 View Wallet
                          </a>
                        )}
                        {notif.type === "success" && notif.title.includes("Contribution") && (
                          <a href="/transactions"
                            className="mt-2 inline-flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg transition-colors font-medium">
                            📊 View Transactions
                          </a>
                        )}
                        {notif.type === "success" && notif.title.includes("Goal") && (
                          <a href="/goals"
                            className="mt-2 inline-flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg transition-colors font-medium">
                            🎯 View Goals
                          </a>
                        )}
                        {notif.type === "alert" && notif.title.includes("Password") && (
                          <a href="/settings"
                            className="mt-2 inline-flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg transition-colors font-medium">
                            🔐 Go to Settings
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}