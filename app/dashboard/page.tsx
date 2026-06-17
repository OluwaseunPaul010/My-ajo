"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  Plus, UserPlus, Send, Clock, BellRing, Gift,
  Search, Moon, Sun, CheckCircle, Zap, Crown,
  ArrowUpRight, BarChart3, Activity, ChevronRight
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
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

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = sessionStorage.getItem("token");
if (!token) {
  window.location.href = "/auth/login";
  return;
}

    Promise.all([
      fetch("/api/user", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/groups", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/goals", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/referral", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([userData, groupsData, txData, goalsData, notifData, refData]) => {
      if (userData.success) {
        setUser(userData.user);
        localStorage.setItem("user", JSON.stringify(userData.user));
      }
      if (groupsData.success) setGroups(groupsData.groups);
      if (txData.success) setTransactions(txData.transactions);
      if (goalsData.success) setGoals(goalsData.goals);
      if (notifData.success) setUnreadCount(notifData.unreadCount);
      if (refData.success) setReferralCode(refData.referralCode);
      setLoading(false);
    });
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.documentElement.classList.toggle("dark", newMode);
  };

  const handleShareInvite = async () => {
    const shareText = `Join me on My Ajo! Use my referral code ${referralCode} when you sign up and we both earn ₦5,000! 🎉\n\nhttps://my-ajo-seven.vercel.app/auth/register?ref=${referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join My Ajo", text: shareText });
      } catch {
        setShowInviteModal(true);
      }
    } else {
      setShowInviteModal(true);
    }
  };

  // Wallet & stats
  const walletBalance = user?.wallet?.balance || 0;
  const totalSaved = transactions
    .filter((t: any) => t.type === "credit" && t.status === "completed")
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  const activeGroupsCount = groups.filter((g: any) => g.status === "active").length;

  // Contribution overview
  const totalExpectedContributions = groups.reduce((sum: number, g: any) => sum + (g.members?.length || 0), 0) || 1;
  const paidContributions = transactions.filter((t: any) => t.type === "debit" && t.groupId && t.status === "completed").length;
  const pendingContributions = Math.max(totalExpectedContributions - paidContributions, 0);
  const missedContributions = 0;
  const completionPercent = Math.min(Math.round((paidContributions / totalExpectedContributions) * 100), 100);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (completionPercent / 100) * circumference;

  // Payout rotation — show first group's rotation
  const primaryGroup = groups[0];
  const rotationMembers = primaryGroup?.members
    ?.slice()
    .sort((a: any, b: any) => a.payoutOrder - b.payoutOrder)
    .slice(0, 2) || [];

  // Search across groups + transactions
  const searchResults = search.trim()
    ? [
        ...groups.filter((g: any) => g.name?.toLowerCase().includes(search.toLowerCase()))
          .map((g: any) => ({ type: "Group", label: g.name, href: `/groups/${g.id}` })),
        ...transactions.filter((t: any) => t.description?.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 5)
          .map((t: any) => ({ type: "Transaction", label: t.description, href: "/transactions" })),
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
            {navItems.map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active ? "bg-emerald-500 text-white" : "text-gray-600 hover:bg-gray-50 hover:text-emerald-500"}`}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.label === "Reminders" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                    {unreadCount}
                  </span>
                )}
              </a>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-100">
            <a href="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors group">
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
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-900">Welcome back, {user?.fullName?.split(" ")[0] || "there"} 👋</h1>
            <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening with your savings</p>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSearchResults(true); }}
              onFocus={() => setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
              placeholder="Search groups, transactions..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
            />
            {showSearchResults && search.trim() && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden max-h-72 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-gray-400 text-center">No results found</div>
                ) : (
                  searchResults.map((r, i) => (
                    <a key={i} href={r.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                      <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">{r.type}</span>
                      <span className="text-sm text-gray-700 truncate">{r.label}</span>
                    </a>
                  ))
                )}
              </div>
            )}
          </div>

          <button onClick={toggleDarkMode} className="p-2 text-gray-500 hover:text-emerald-500 transition-colors flex-shrink-0">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <a href="/reminders" className="relative p-2 text-gray-500 hover:text-emerald-500 transition-colors flex-shrink-0">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </a>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Wallet Balance", value: `₦${walletBalance.toLocaleString()}`, icon: Wallet, color: "bg-emerald-100 text-emerald-500" },
              { label: "Total Saved", value: `₦${totalSaved.toLocaleString()}`, icon: TrendingUp, color: "bg-blue-50 text-blue-500" },
              { label: "Active Groups", value: activeGroupsCount, icon: Users, color: "bg-amber-50 text-amber-500" },
              { label: "Trust Score", value: `${user?.trustScore || 100}%`, icon: Shield, color: "bg-purple-50 text-purple-500" },
            ].map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{stat.label}</span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Overview Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Contribution Overview — linked to groups */}
            <a href="/groups"
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all block cursor-pointer">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-gray-900">My Contribution Overview</h2>
                <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                  View Groups <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-36 h-36">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#10b981" strokeWidth="10"
                      strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{paidContributions}/{totalExpectedContributions}</span>
                    <span className="text-xs text-gray-400">Completed</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Paid", value: paidContributions, color: "bg-emerald-500" },
                  { label: "Pending", value: pendingContributions, color: "bg-amber-400" },
                  { label: "Missed", value: missedContributions, color: "bg-red-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-gray-600">{item.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </a>

            {/* Payout Rotation */}
            <a href="/groups"
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all block cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Payout Rotation</h2>
                <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                  View Groups <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              {!primaryGroup ? (
                <div className="text-center py-10 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                  <p className="text-sm">Join a group to see rotation</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {rotationMembers.map((member: any, i: number) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-emerald-50" : "bg-amber-50"}`}>
                        <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                        <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm flex-shrink-0">
                          {member.user?.fullName?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {member.userId === user?.id ? "You" : member.user?.fullName}
                          </div>
                          <div className="text-xs text-gray-400">₦{primaryGroup.contribution?.toLocaleString()}</div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0 ${i === 0 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                          {i === 0 ? "Paid" : "Next Up"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3 text-center">Showing rotation for: {primaryGroup.name}</p>
                </>
              )}
            </a>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { icon: Plus, label: "Create Group", href: "/groups" },
                  { icon: UserPlus, label: "Join Group", href: "/groups" },
                  { icon: ArrowUpRight, label: "Invite Friends", action: handleShareInvite },
                  { icon: Send, label: "Send Money", href: "/wallet" },
                  { icon: Clock, label: "Reminders", href: "/reminders" },
                  { icon: BellRing, label: "Notifications", href: "/reminders" },
                ].map((action, i) =>
                  action.action ? (
                    <button key={i} onClick={action.action}
                      className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <action.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="text-xs text-gray-600 font-medium text-center">{action.label}</span>
                    </button>
                  ) : (
                    <a key={i} href={action.href}
                      className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <action.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="text-xs text-gray-600 font-medium text-center">{action.label}</span>
                    </a>
                  )
                )}
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4" />
                    <h3 className="font-bold text-sm">Refer & Earn</h3>
                  </div>
                  <p className="text-emerald-100 text-xs mb-3">Invite friends and earn up to ₦5,000</p>
                  <button onClick={handleShareInvite}
                    className="bg-white text-emerald-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors">
                    Invite Friends
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* My Ajo Groups */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">My Ajo Groups</h2>
              <a href="/groups" className="text-sm text-emerald-500 hover:underline font-medium flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
            {groups.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                <p className="font-medium text-gray-500">No groups yet</p>
                <a href="/groups" className="text-sm text-emerald-500 hover:underline">Create or join a group →</a>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {groups.slice(0, 5).map((group: any, i: number) => (
                  <a key={i} href={`/groups/${group.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
                      {group.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">{group.name}</span>
                        {group.myRole === "admin" && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-gray-400">{group.members?.length || 0} members · {group.frequency} · ₦{group.contribution?.toLocaleString()}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${group.status === "active" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                      {group.status}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Invite Friends</h3>
              <button onClick={() => setShowInviteModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white mb-4">
              <p className="text-emerald-100 text-sm mb-1">Your Referral Code</p>
              <p className="text-3xl font-bold tracking-wider">{referralCode || "Loading..."}</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Share this code with friends. When they sign up, you both earn ₦5,000! 🎉
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Join me on My Ajo! Use my referral code ${referralCode} when you sign up and we both earn ₦5,000! 🎉\n\nhttps://my-ajo-seven.vercel.app/auth/register?ref=${referralCode}`
                  );
                  alert("✅ Invite message copied!");
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors">
                Copy Message
              </button>
              <button
                onClick={handleShareInvite}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                Share Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}