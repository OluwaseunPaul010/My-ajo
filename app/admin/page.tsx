"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, Shield,
  Menu, X, LogOut, AlertCircle, CheckCircle,
  Ban, Eye, Search, BarChart3, Settings,
  ArrowUpRight, ArrowDownLeft, Flag, RefreshCw
} from "lucide-react";

const navItems = [
  { icon: BarChart3, label: "Overview", id: "overview" },
  { icon: Users, label: "Users", id: "users" },
  { icon: Shield, label: "Groups", id: "groups" },
  { icon: Wallet, label: "Transactions", id: "transactions" },
  { icon: AlertCircle, label: "Fraud Monitor", id: "fraud" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const [statsRes, usersRes, txRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/transactions", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [statsData, usersData, txData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        txRes.json(),
      ]);

      if (statsData.success) setStats(statsData);
      if (usersData.success) setUsers(usersData.users);
      if (txData.success) setTransactions(txData.transactions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTransactions = transactions.filter((t) =>
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-800">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold">My Ajo</span>
              <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Admin</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item, i) => (
              <button key={i} onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeNav === item.id ? "bg-emerald-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">AD</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">Super Admin</div>
                <div className="text-xs text-emerald-400">admin@myajo.com</div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/auth/login";
                }}
                className="text-gray-400 hover:text-red-400 transition-colors">
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
            <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">My Ajo platform management</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={fetchData}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-500 transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <span className="text-xs bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-medium">● System Online</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeNav === "overview" && (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Users", value: stats?.totalUsers || 0, change: `+${stats?.newUsersToday || 0} today`, icon: Users, color: "bg-emerald-100 text-emerald-500" },
                      { label: "Active Groups", value: stats?.totalGroups || 0, change: `${stats?.activeGroups || 0} active`, icon: Shield, color: "bg-blue-50 text-blue-500" },
                      { label: "Total Volume", value: `₦${(stats?.totalVolume || 0).toLocaleString()}`, change: "All time", icon: TrendingUp, color: "bg-amber-50 text-amber-500" },
                      { label: "Total Transactions", value: stats?.totalTransactions || 0, change: `+${stats?.todayTransactions || 0} today`, icon: Wallet, color: "bg-purple-50 text-purple-500" },
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
                        <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-xs text-emerald-500 font-medium">{stat.change}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Platform Health */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <h2 className="text-base font-semibold text-gray-900 mb-4">Platform Health</h2>
                      <div className="space-y-4">
                        {[
                          { label: "Verified Users", value: stats?.verifiedUsers || 0, total: stats?.totalUsers || 1, color: "bg-emerald-500" },
                          { label: "Active Groups", value: stats?.activeGroups || 0, total: stats?.totalGroups || 1, color: "bg-blue-500" },
                          { label: "Completed Transactions", value: stats?.completedTransactions || 0, total: stats?.totalTransactions || 1, color: "bg-amber-500" },
                        ].map((item, i) => {
                          const percent = Math.round((item.value / item.total) * 100);
                          return (
                            <div key={i}>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">{item.label}</span>
                                <span className="font-semibold text-gray-900">{item.value} ({percent}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className={`${item.color} h-2 rounded-full`} style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Stats</h2>
                      <div className="space-y-3">
                        {[
                          { label: "Total Wallet Balance", value: `₦${(stats?.totalWalletBalance || 0).toLocaleString()}`, icon: Wallet, color: "bg-emerald-100 text-emerald-500" },
                          { label: "Total Referral Earnings", value: `₦${(stats?.totalReferralEarnings || 0).toLocaleString()}`, icon: Users, color: "bg-amber-50 text-amber-500" },
                          { label: "BVN Verified Users", value: stats?.bvnVerifiedUsers || 0, icon: Shield, color: "bg-blue-50 text-blue-500" },
                          { label: "Total Goals Created", value: stats?.totalGoals || 0, icon: TrendingUp, color: "bg-purple-50 text-purple-500" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                            <span className="text-sm font-bold text-gray-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Transactions</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">User</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Description</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {transactions.slice(0, 10).map((tx: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{tx.user?.fullName || "Unknown"}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{tx.description}</td>
                              <td className={`px-4 py-3 text-sm font-semibold ${tx.type === "credit" ? "text-emerald-500" : "text-red-400"}`}>
                                {tx.type === "credit" ? "+" : "-"}₦{tx.amount?.toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${tx.status === "completed" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-400">
                                {new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeNav === "users" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-gray-900">User Management ({users.length})</h2>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">User</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Phone</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Trust</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Joined</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map((user: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-xs">
                                  {user.fullName?.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                    {user.fullName}
                                    {user.isVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                                  </div>
                                  <div className="text-xs text-gray-400">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${user.trustScore || 100}%` }} />
                                </div>
                                <span className="text-xs text-gray-500">{user.trustScore || 100}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.isVerified ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                                {user.isVerified ? "Verified" : "Unverified"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                                  <Ban className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors">
                                  <Flag className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Transactions Tab */}
              {activeNav === "transactions" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-gray-900">All Transactions ({transactions.length})</h2>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search transactions..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">User</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Description</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Type</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredTransactions.map((tx: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.user?.fullName || "Unknown"}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{tx.description}</td>
                            <td className={`px-6 py-4 text-sm font-semibold ${tx.type === "credit" ? "text-emerald-500" : "text-red-400"}`}>
                              {tx.type === "credit" ? "+" : "-"}₦{tx.amount?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${tx.type === "credit" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                                {tx.type === "credit" ? "Credit" : "Debit"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${tx.status === "completed" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-400">
                              {new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Fraud Monitor Tab */}
              {activeNav === "fraud" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Fraud Monitoring</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {[
                        { label: "Low Trust Users", value: users.filter((u) => (u.trustScore || 100) < 70).length, color: "bg-red-50 text-red-500" },
                        { label: "Unverified Users", value: users.filter((u) => !u.isVerified).length, color: "bg-amber-50 text-amber-500" },
                        { label: "Locked Accounts", value: users.filter((u) => u.lockedUntil && new Date(u.lockedUntil) > new Date()).length, color: "bg-purple-50 text-purple-500" },
                      ].map((stat, i) => (
                        <div key={i} className={`p-4 rounded-xl ${stat.color}`}>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-sm font-medium mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Users with Low Trust Score</h3>
                    <div className="space-y-2">
                      {users.filter((u) => (u.trustScore || 100) < 80).length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                          <p className="text-sm">No fraud alerts! All users have good trust scores.</p>
                        </div>
                      ) : (
                        users.filter((u) => (u.trustScore || 100) < 80).map((user: any, i: number) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold text-sm">
                              {user.fullName?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-xs text-gray-400">{user.email}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-red-500">{user.trustScore}%</div>
                              <div className="text-xs text-gray-400">Trust Score</div>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                                <Ban className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Groups Tab */}
              {activeNav === "groups" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">All Groups</h2>
                  </div>
                  <div className="p-6 text-center text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                    <p className="text-sm font-medium text-gray-500">Group management coming soon</p>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeNav === "settings" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">Admin Settings</h2>
                  <div className="space-y-4">
                    {[
                      { label: "Maintenance Mode", desc: "Put the platform in maintenance mode" },
                      { label: "New User Registration", desc: "Allow new users to register" },
                      { label: "Referral System", desc: "Enable/disable referral rewards" },
                      { label: "Email Notifications", desc: "Send platform-wide emails" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-400">{item.desc}</div>
                        </div>
                        <button className="relative w-11 h-6 rounded-full bg-emerald-500">
                          <div className="absolute top-1 translate-x-6 w-4 h-4 bg-white rounded-full shadow" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}