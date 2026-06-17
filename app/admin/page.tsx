"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Shield,
  Menu, X, LogOut, AlertCircle, CheckCircle,
  Ban, Eye, Search, BarChart3, Settings,
  Flag, RefreshCw, Trash2, ArrowUpRight,
  ArrowDownLeft, Bell, Target, ChevronRight
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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    maintenanceMode: false,
    newUserRegistration: true,
    referralSystem: true,
    emailNotifications: true,
  });
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setCurrentAdmin(JSON.parse(stored));
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = sessionStorage.getItem("token");
    try {
      const [statsRes, usersRes, txRes, groupsRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/transactions", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/groups", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [statsData, usersData, txData, groupsData] = await Promise.all([
        statsRes.json(), usersRes.json(), txRes.json(), groupsRes.json(),
      ]);

      if (statsData.success) setStats(statsData);
      if (usersData.success) setUsers(usersData.users);
      if (txData.success) setTransactions(txData.transactions);
      if (groupsData.success) setGroups(groupsData.groups);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewActivity = async (user: any) => {
    setSelectedUser(user);
    setShowActivityModal(true);
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/user-activity?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUserActivity(data);
    } catch {
      console.error("Failed to fetch activity");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Delete ${userName}'s account? This cannot be undone.`)) return;
    if (!confirm("All their data including wallet, transactions and goals will be permanently deleted. Continue?")) return;
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u.id !== userId));
        alert(`✅ ${userName}'s account deleted successfully`);
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Delete group "${groupName}"? This cannot be undone.`)) return;
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/groups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (data.success) {
        setGroups(groups.filter((g) => g.id !== groupId));
        alert(`✅ Group "${groupName}" deleted`);
      } else {
        alert(data.error || "Failed to delete group");
      }
    } catch {
      alert("Something went wrong");
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

  const filteredGroups = groups.filter((g) =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
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
              <button key={i} onClick={() => { setActiveNav(item.id); setSearch(""); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeNav === item.id ? "bg-emerald-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {currentAdmin?.fullName?.charAt(0) || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{currentAdmin?.fullName || "Admin"}</div>
                <div className="text-xs text-emerald-400">{currentAdmin?.email || "admin@myajo.com"}</div>
              </div>
              <button
                onClick={() => {
                  sessionStorage.removeItem("token");
                  sessionStorage.removeItem("user");
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
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${adminSettings.maintenanceMode ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
              ● {adminSettings.maintenanceMode ? "Maintenance Mode" : "System Online"}
            </span>
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <h2 className="text-base font-semibold text-gray-900 mb-4">Platform Health</h2>
                      <div className="space-y-4">
                        {[
                          { label: "Verified Users", value: stats?.verifiedUsers || 0, total: stats?.totalUsers || 1, color: "bg-emerald-500" },
                          { label: "Active Groups", value: stats?.activeGroups || 0, total: stats?.totalGroups || 1, color: "bg-blue-500" },
                          { label: "Completed Transactions", value: stats?.completedTransactions || 0, total: stats?.totalTransactions || 1, color: "bg-amber-500" },
                        ].map((item, i) => {
                          const percent = Math.round((item.value / item.total) * 100) || 0;
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
                          {transactions.slice(0, 8).map((tx: any, i: number) => (
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
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">User</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Phone</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Wallet</th>
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
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              ₦{(user.wallet?.balance || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                  <div className={`h-1.5 rounded-full ${(user.trustScore || 100) >= 80 ? "bg-emerald-500" : (user.trustScore || 100) >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                                    style={{ width: `${user.trustScore || 100}%` }} />
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
                                <button
                                  onClick={() => handleViewActivity(user)}
                                  title="View Activity"
                                  className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.fullName)}
                                  title="Delete User"
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button title="Flag User"
                                  className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
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

              {/* Groups Tab */}
              {activeNav === "groups" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-gray-900">Group Management ({groups.length})</h2>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search groups..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Group</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Members</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Contribution</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Frequency</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Invite Code</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredGroups.map((group: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-semibold text-xs">
                                  {group.name?.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{group.name}</div>
                                  <div className="text-xs text-gray-400">{group.description || "No description"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {group._count?.members || 0}/{group.maxMembers}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              ₦{group.contribution?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">{group.frequency}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${group.status === "active" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                                {group.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-emerald-600">{group.inviteCode}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteGroup(group.id, group.name)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                        { label: "Low Trust Users", value: users.filter((u) => (u.trustScore || 100) < 70).length, color: "bg-red-50 border border-red-100 text-red-500" },
                        { label: "Unverified Users", value: users.filter((u) => !u.isVerified).length, color: "bg-amber-50 border border-amber-100 text-amber-500" },
                        { label: "Locked Accounts", value: users.filter((u) => u.lockedUntil && new Date(u.lockedUntil) > new Date()).length, color: "bg-purple-50 border border-purple-100 text-purple-500" },
                      ].map((stat, i) => (
                        <div key={i} className={`p-4 rounded-xl ${stat.color}`}>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-sm font-medium mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Users Requiring Attention</h3>
                    {users.filter((u) => (u.trustScore || 100) < 80 || (u.lockedUntil && new Date(u.lockedUntil) > new Date())).length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                        <p className="text-sm">No fraud alerts! All users are in good standing.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {users.filter((u) => (u.trustScore || 100) < 80 || (u.lockedUntil && new Date(u.lockedUntil) > new Date())).map((user: any, i: number) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold text-sm">
                              {user.fullName?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-xs text-gray-400">{user.email}</div>
                              {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                                <div className="text-xs text-red-500 mt-0.5">⚠️ Account locked</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-red-500">{user.trustScore || 100}%</div>
                              <div className="text-xs text-gray-400">Trust Score</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleViewActivity(user)}
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteUser(user.id, user.fullName)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeNav === "settings" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-2">Platform Settings</h2>
                    <p className="text-sm text-gray-400 mb-6">Toggle platform features on or off</p>
                    <div className="space-y-4">
                      {[
                        { key: "maintenanceMode", label: "Maintenance Mode", desc: "Put the platform in maintenance mode — users won't be able to access the app", danger: true },
                        { key: "newUserRegistration", label: "New User Registration", desc: "Allow new users to register accounts", danger: false },
                        { key: "referralSystem", label: "Referral System", desc: "Enable ₦5,000 referral rewards for inviting friends", danger: false },
                        { key: "emailNotifications", label: "Email Notifications", desc: "Send automated emails (verification, reset codes, welcome)", danger: false },
                      ].map((item) => (
                        <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl border ${item.danger && adminSettings[item.key as keyof typeof adminSettings] ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100"}`}>
                          <div>
                            <div className={`text-sm font-medium ${item.danger && adminSettings[item.key as keyof typeof adminSettings] ? "text-red-700" : "text-gray-900"}`}>
                              {item.label}
                              {item.danger && adminSettings[item.key as keyof typeof adminSettings] && (
                                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">ACTIVE</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                          </div>
                          <button
                            onClick={() => setAdminSettings({ ...adminSettings, [item.key]: !adminSettings[item.key as keyof typeof adminSettings] })}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${adminSettings[item.key as keyof typeof adminSettings] ? item.danger ? "bg-red-500" : "bg-emerald-500" : "bg-gray-300"}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${adminSettings[item.key as keyof typeof adminSettings] ? "translate-x-7" : "translate-x-1"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-2">Admin Access</h2>
                    <p className="text-sm text-gray-400 mb-4">Users with admin role can access this dashboard</p>
                    <div className="space-y-2">
                      {users.filter((u) => u.role === "admin").length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                          <Shield className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                          <p className="text-sm">No other admins yet</p>
                          <p className="text-xs mt-1">Set a user&apos;s role to &quot;admin&quot; in the database to grant access</p>
                        </div>
                      ) : (
                        users.filter((u) => u.role === "admin").map((admin: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {admin.fullName?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{admin.fullName}</div>
                              <div className="text-xs text-gray-400">{admin.email}</div>
                            </div>
                            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full font-medium">Admin</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-700">💡 To grant admin access to a team member, update their role to &quot;admin&quot; in the database. They can then log in with their normal account at /admin</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* User Activity Modal */}
      {showActivityModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedUser.fullName}</h3>
                <p className="text-sm text-gray-400">{selectedUser.email} · Account Activity</p>
              </div>
              <button onClick={() => { setShowActivityModal(false); setUserActivity(null); }}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {!userActivity ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* User Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Wallet Balance", value: `₦${(userActivity.user?.wallet?.balance || 0).toLocaleString()}` },
                      { label: "Trust Score", value: `${userActivity.user?.trustScore || 100}%` },
                      { label: "Groups", value: userActivity.groups?.length || 0 },
                      { label: "Goals", value: userActivity.goals?.length || 0 },
                    ].map((stat, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Groups */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Groups ({userActivity.groups?.length || 0})</h4>
                    {userActivity.groups?.length === 0 ? (
                      <p className="text-sm text-gray-400">No groups yet</p>
                    ) : (
                      <div className="space-y-2">
                        {userActivity.groups?.map((group: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-semibold text-xs">
                              {group.name?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{group.name}</div>
                              <div className="text-xs text-gray-400">₦{group.contribution?.toLocaleString()} · {group.frequency}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Transactions */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Transactions ({userActivity.transactions?.length || 0})</h4>
                    {userActivity.transactions?.length === 0 ? (
                      <p className="text-sm text-gray-400">No transactions yet</p>
                    ) : (
                      <div className="space-y-2">
                        {userActivity.transactions?.slice(0, 8).map((tx: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-100" : "bg-red-50"}`}>
                              {tx.type === "credit"
                                ? <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                                : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-900 truncate">{tx.description}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                            </div>
                            <div className={`text-sm font-semibold ${tx.type === "credit" ? "text-emerald-500" : "text-red-400"}`}>
                              {tx.type === "credit" ? "+" : "-"}₦{tx.amount?.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Notifications */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Notifications</h4>
                    {userActivity.notifications?.length === 0 ? (
                      <p className="text-sm text-gray-400">No notifications yet</p>
                    ) : (
                      <div className="space-y-2">
                        {userActivity.notifications?.slice(0, 5).map((notif: any, i: number) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-xl">
                            <div className="text-xs font-medium text-gray-900">{notif.title}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{notif.message}</div>
                            <div className="text-xs text-gray-300 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => handleDeleteUser(selectedUser.id, selectedUser.fullName)}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
              <button
                onClick={() => { setShowActivityModal(false); setUserActivity(null); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}