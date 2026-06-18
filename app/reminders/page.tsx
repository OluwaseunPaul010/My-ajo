"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  Clock, AlertCircle, CheckCircle, Calendar,
  BarChart3, Activity, Gift, ChevronRight, Zap
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Reminders", href: "/reminders", active: true },
  { icon: MessageCircle, label: "Messages", href: "/chat" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Gift, label: "Refer & Earn", href: "/referral" },
  { icon: Activity, label: "Activity Log", href: "/activity" },
  { icon: Shield, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function RemindersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [stats, setStats] = useState({ active: 0, upcoming: 0, missed: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }

    fetch("/api/reminders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setReminders(data.reminders);
          setStats(data.stats);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? reminders
    : reminders.filter((r) => r.status === filter);

  const getStatusColor = (status: string) => {
    if (status === "missed") return "bg-red-50 border-red-200";
    if (status === "active") return "bg-amber-50 border-amber-200";
    return "bg-white border-gray-100";
  };

  const getStatusBadge = (status: string, daysUntil: number) => {
    if (status === "missed") return { color: "bg-red-100 text-red-500", label: "Overdue!" };
    if (status === "active") return { color: "bg-amber-100 text-amber-600", label: `Due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}!` };
    return { color: "bg-emerald-100 text-emerald-600", label: `${daysUntil} days left` };
  };

  const getStatusIcon = (status: string) => {
    if (status === "missed") return <AlertCircle className="w-5 h-5 text-red-400" />;
    if (status === "active") return <Zap className="w-5 h-5 text-amber-500" />;
    return <Clock className="w-5 h-5 text-emerald-500" />;
  };

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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active ? "bg-emerald-500 text-white" : "text-gray-600 hover:bg-gray-50 hover:text-emerald-500"}`}>
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
            <h1 className="text-lg font-bold text-gray-900">Reminders</h1>
            <p className="text-sm text-gray-500">Stay on top of your group contributions</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Due Soon", value: stats.active, icon: Zap, color: "bg-amber-50 text-amber-500" },
              { label: "Upcoming", value: stats.upcoming, icon: Calendar, color: "bg-emerald-100 text-emerald-500" },
              { label: "Missed", value: stats.missed, icon: AlertCircle, color: "bg-red-50 text-red-400" },
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
              { id: "all", label: "All Groups" },
              { id: "active", label: "Due Soon" },
              { id: "upcoming", label: "Upcoming" },
              { id: "missed", label: "Missed" },
            ].map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f.id ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Reminders List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
              <p className="font-medium text-gray-500">All caught up!</p>
              <p className="text-sm">No reminders in this category</p>
              {reminders.length === 0 && (
                <a href="/groups" className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-500 hover:underline">
                  Join a group to see reminders <ChevronRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((reminder: any, i: number) => {
                const badge = getStatusBadge(reminder.status, reminder.daysUntil);
                return (
                  <motion.a key={i}
                    href={`/groups/${reminder.groupId}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all block ${getStatusColor(reminder.status)}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${reminder.status === "missed" ? "bg-red-100" : reminder.status === "active" ? "bg-amber-100" : "bg-emerald-100"}`}>
                      {getStatusIcon(reminder.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{reminder.groupName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5" />
                          ₦{reminder.amount?.toLocaleString()} due
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(reminder.nextDueDate).toLocaleDateString("en-NG", {
                            weekday: "short", day: "numeric", month: "short"
                          })}
                        </span>
                        <span className="capitalize flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {reminder.frequency}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </motion.a>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}