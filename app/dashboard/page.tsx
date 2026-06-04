"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Plus, ArrowUpRight,
  ArrowDownLeft, Target, Shield, Zap, ChevronRight,
  CheckCircle, Clock
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Users, label: "My Groups", href: "/groups" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
{ icon: MessageCircle, label: "Messages", href: "/chat" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Shield, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [realTransactions, setRealTransactions] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        });

      fetch("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setRealTransactions(data.transactions);
        });

      fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setUnreadCount(data.unreadCount);
        });
    }
  }, []);

  const hasGroups = user?.groups?.length > 0;

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
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${item.active ? "bg-white text-emerald-500" : "bg-emerald-100 text-emerald-600"}`}>
                    {item.badge}
                  </span>
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
            <h1 className="text-lg font-bold text-gray-900">{greeting()}, {user?.fullName?.split(" ")[0] || "there"} 👋</h1>
            <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening with your savings today.</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a href="/notifications" className="relative p-2 text-gray-500 hover:text-emerald-500 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </a>
            <a href="/wallet" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Fund Wallet
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Wallet Balance", value: `₦${(user?.wallet?.balance || 0).toLocaleString()}.00`, sub: "Available Balance", icon: Wallet },
              { label: "Total Contributions", value: `₦${realTransactions.filter((t: any) => t.type === "debit").reduce((s: number, t: any) => s + t.amount, 0).toLocaleString()}.00`, sub: "All time", icon: TrendingUp },
              { label: "Upcoming Payout", value: "₦0.00", sub: "No upcoming payout", icon: Zap },
              { label: "Contribution Streak", value: `${user?.streak || 0} Weeks`, sub: user?.streak > 0 ? "Amazing! Keep it up 🔥" : "Start contributing!", icon: Target },
            ].map((card, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 font-medium">{card.label}</span>
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                <div className="text-xs text-gray-400">{card.sub}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Contribution Overview */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">My Contribution Overview</h2>
              {!hasGroups ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-emerald-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No contributions yet</p>
                  <p className="text-xs text-gray-400 mt-1">Join a group to start contributing!</p>
                  <a href="/groups" className="mt-3 inline-block text-xs text-emerald-500 font-medium hover:underline">
                    Browse Groups →
                  </a>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="251 314" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">8/10</span>
                        <span className="text-xs text-gray-400">Completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Paid", value: "₦160,000", color: "bg-emerald-500" },
                      { label: "Pending", value: "₦40,000", color: "bg-amber-400" },
                      { label: "Missed", value: "0", color: "bg-red-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-gray-600">{item.label}</span>
                        </div>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Payout Rotation */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Payout Rotation</h2>
                <a href="#" className="text-xs text-emerald-500 font-medium">View Full</a>
              </div>
              {!hasGroups ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-emerald-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No payout rotation yet</p>
                  <p className="text-xs text-gray-400 mt-1">Join a group to see rotation!</p>
                  <a href="/groups" className="mt-3 inline-block text-xs text-emerald-500 font-medium hover:underline">
                    Join a Group →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { name: "Tunde Adeyemi", date: "May 1, 2025", status: "Paid", color: "text-emerald-500 bg-emerald-50" },
                    { name: "Chioma Okafor", date: "May 15 (in 2 days)", status: "Upcoming", color: "text-amber-500 bg-amber-50" },
                    { name: "Emeka Nwosu", date: "May 29, 2025", status: "Waiting", color: "text-gray-400 bg-gray-50" },
                    { name: "Adesola Bankole", date: "June 12, 2025", status: "Waiting", color: "text-gray-400 bg-gray-50" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-4">{i + 1}</span>
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-xs">
                        {item.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                        <div className="text-xs text-gray-400">{item.date}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Plus, label: "Create Group", href: "/groups" },
                  { icon: Users, label: "Join Group", href: "/groups" },
                  { icon: ArrowUpRight, label: "Invite Friends", href: "/groups" },
                  { icon: ArrowUpRight, label: "Send Money", href: "/wallet" },
                  { icon: Clock, label: "Reminders", href: "/reminders" },
                  { icon: Bell, label: "Notifications", href: "/notifications" },
                ].map((action, i) => (
                  <a key={i} href={action.href} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-emerald-50 transition-colors group">
                    <div className="w-10 h-10 bg-gray-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
                      <action.icon className="w-5 h-5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <span className="text-xs text-gray-500 text-center leading-tight">{action.label}</span>
                  </a>
                ))}
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                <div className="text-sm font-semibold mb-1">Refer & Earn</div>
                <div className="text-xs text-emerald-100 mb-3">Invite friends and earn up to ₦5,000</div>
                <button className="bg-white text-emerald-600 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors">
                  Invite Friends
                </button>
              </div>
            </div>
          </div>

          {/* Groups */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">My Ajo Groups</h2>
              <a href="/groups" className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </a>
            </div>
            {!hasGroups ? (
              <div className="text-center py-8 text-gray-400">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-emerald-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No groups yet</p>
                <p className="text-xs text-gray-400 mt-1">Create or join a savings group!</p>
                <a href="/groups" className="mt-3 inline-block bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                  Get Started →
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.groups.slice(0, 3).map((group: any, i: number) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-emerald-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{group.name}</div>
                        <div className="text-xs text-gray-400">{group.members?.length || 1} members · {group.frequency}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>₦{group.contribution?.toLocaleString()}/cycle</span>
                      <span className="text-emerald-500 font-mono">{group.inviteCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
              <a href="/transactions" className="text-xs text-emerald-500 font-medium">View All</a>
            </div>
            {realTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-emerald-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No transactions yet</p>
                <p className="text-xs text-gray-400 mt-1">Fund your wallet to get started!</p>
                <a href="/wallet" className="mt-3 inline-block bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                  Fund Wallet →
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {realTransactions.slice(0, 5).map((tx: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-100" : "bg-red-50"}`}>
                      {tx.type === "credit"
                        ? <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                        : <ArrowUpRight className="w-5 h-5 text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{tx.description}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${tx.type === "credit" ? "text-emerald-500" : "text-red-400"}`}>
                        {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                      </div>
                      <div className={`text-xs ${tx.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}