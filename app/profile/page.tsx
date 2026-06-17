"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  CheckCircle, Star, Award, Calendar, ArrowUpRight,
  ArrowDownLeft, Edit
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

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalIn, setTotalIn] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = sessionStorage.getItem("token");
    if (token) {
      fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
            setWalletBalance(data.user.wallet?.balance || 0);
            setGroups(data.user.groups || []);
          }
        });

      fetch("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setTransactions(data.transactions);
            setTotalIn(data.totalIn);
          }
        });
    }
  }, []);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" })
    : "Recently";

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
                  sessionStorage.removeItem("token");
                  sessionStorage.removeItem("user");
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
            <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">View your profile and activity</p>
          </div>
          <a href="/settings"
            className="ml-auto flex items-center gap-2 border border-gray-200 hover:border-emerald-500 text-gray-600 hover:text-emerald-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Edit className="w-4 h-4" /> Edit Profile
          </a>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {user?.fullName?.split(" ").map((n: string) => n[0]).join("") || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{user?.fullName || "User"}</h2>
                  {user?.isVerified && <CheckCircle className="w-5 h-5 text-white" />}
                </div>
                <p className="text-emerald-100 text-sm">{user?.email}</p>
                <p className="text-emerald-100 text-sm">{user?.phone}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Premium Member
                  </span>
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Joined {joinDate}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Wallet Balance", value: `₦${walletBalance.toLocaleString()}`, icon: Wallet, color: "bg-emerald-100 text-emerald-500" },
              { label: "Active Groups", value: groups.length.toString(), icon: Users, color: "bg-blue-50 text-blue-500" },
              { label: "Total Saved", value: `₦${totalIn.toLocaleString()}`, icon: TrendingUp, color: "bg-amber-50 text-amber-500" },
              { label: "Trust Score", value: `${user?.trustScore || 100}%`, icon: Shield, color: "bg-purple-50 text-purple-500" },
            ].map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Badges & Achievements */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Badges & Achievements</h2>
              <div className="space-y-3">
                {[
                  { icon: "🏆", title: "Early Adopter", desc: "One of our first members", earned: true },
                  { icon: "⭐", title: "Consistent Saver", desc: "Never missed a contribution", earned: transactions.length > 0 },
                  { icon: "👥", title: "Group Creator", desc: "Created your first group", earned: groups.length > 0 },
                  { icon: "💰", title: "Big Saver", desc: "Saved over ₦100,000", earned: totalIn >= 100000 },
                  { icon: "🔥", title: "On Fire", desc: "16 week contribution streak", earned: (user?.streak || 0) >= 16 },
                ].map((badge, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${badge.earned ? "bg-emerald-50" : "bg-gray-50 opacity-50"}`}>
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{badge.title}</div>
                      <div className="text-xs text-gray-400">{badge.desc}</div>
                    </div>
                    {badge.earned && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* My Groups */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">My Groups</h2>
              {groups.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                  <p className="text-sm text-gray-500">No groups yet</p>
                  <a href="/groups" className="text-xs text-emerald-500 hover:underline mt-1 block">
                    Join a group →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.slice(0, 4).map((group: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {group.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{group.name}</div>
                        <div className="text-xs text-gray-400">₦{group.contribution?.toLocaleString()} · {group.frequency}</div>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg">active</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <TrendingUp className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                  <p className="text-sm text-gray-500">No activity yet</p>
                  <a href="/wallet" className="text-xs text-emerald-500 hover:underline mt-1 block">
                    Fund wallet →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-100" : "bg-red-50"}`}>
                        {tx.type === "credit"
                          ? <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                          : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">{tx.description}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                      <div className={`text-xs font-semibold ${tx.type === "credit" ? "text-emerald-500" : "text-red-400"}`}>
                        {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}