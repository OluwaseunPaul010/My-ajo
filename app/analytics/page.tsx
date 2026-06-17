"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  ArrowUpRight, ArrowDownLeft, BarChart3
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

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

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = sessionStorage.getItem("token");
    if (token) {
      fetch("/api/user", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
            setWalletBalance(data.user.wallet?.balance || 0);
            setGroups(data.user.groups || []);
          }
        });

      fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setTransactions(data.transactions);
            setTotalIn(data.totalIn);
            setTotalOut(data.totalOut);
          }
        });
    }
  }, []);

  const monthlyData = () => {
    const months: Record<string, { month: string; income: number; expense: number }> = {};
    transactions.forEach((tx) => {
      const month = new Date(tx.createdAt).toLocaleDateString("en-NG", { month: "short", year: "2-digit" });
      if (!months[month]) months[month] = { month, income: 0, expense: 0 };
      if (tx.type === "credit") months[month].income += tx.amount;
      else months[month].expense += tx.amount;
    });
    return Object.values(months).slice(-6);
  };

  const categoryData = () => {
    const categories: Record<string, number> = {};
    transactions.filter((tx) => tx.type === "debit").forEach((tx) => {
      const cat = tx.description.includes("Contribution") ? "Contributions"
        : tx.description.includes("Goal") ? "Goals"
        : tx.description.includes("Withdrawal") ? "Withdrawals"
        : "Other";
      categories[cat] = (categories[cat] || 0) + tx.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const savingsGrowth = () => {
    let balance = 0;
    const sorted = [...transactions].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return sorted.map((tx) => {
      balance += tx.type === "credit" ? tx.amount : -tx.amount;
      return {
        date: new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
        balance: Math.max(0, balance),
      };
    });
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
            <h1 className="text-lg font-bold text-gray-900">Savings Analytics</h1>
            <p className="text-sm text-gray-500">Track your financial progress</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Wallet Balance", value: `₦${walletBalance.toLocaleString()}`, icon: Wallet, color: "bg-emerald-100 text-emerald-500" },
              { label: "Total Income", value: `₦${totalIn.toLocaleString()}`, icon: ArrowDownLeft, color: "bg-blue-50 text-blue-500" },
              { label: "Total Spent", value: `₦${totalOut.toLocaleString()}`, icon: ArrowUpRight, color: "bg-red-50 text-red-400" },
              { label: "Active Groups", value: groups.length.toString(), icon: Users, color: "bg-amber-50 text-amber-500" },
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

          {transactions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <BarChart3 className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No data yet!</h3>
              <p className="text-gray-400 text-sm">Start saving and contributing to see your analytics.</p>
              <a href="/wallet" className="mt-4 inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors">
                Fund Wallet →
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Savings Growth Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-6">Wallet Balance Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={savingsGrowth()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => [`₦${v.toLocaleString()}`, "Balance"]} />
                    <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Monthly Income vs Expense */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-6">Monthly Income vs Expenses</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => `₦${v.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending by Category */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-6">Spending by Category</h2>
                  {categoryData().length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">No spending data yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={categoryData()} cx="50%" cy="50%" outerRadius={80}
                          dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {categoryData().map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => `₦${v.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>

                {/* Group Performance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">Group Performance</h2>
                  {groups.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                      <p className="text-sm">No groups yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {groups.map((group: any, i: number) => {
                        const groupTxns = transactions.filter((t) => t.groupId === group.id);
                        const contributed = groupTxns.reduce((s, t) => s + t.amount, 0);
                        const expected = group.contribution * (group.members?.length || 1);
                        const percent = expected > 0 ? Math.min(Math.round((contributed / expected) * 100), 100) : 0;
                        return (
                          <div key={i} className="p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{group.name}</span>
                              <span className="text-xs text-emerald-500 font-semibold">{percent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-400">₦{contributed.toLocaleString()} contributed</span>
                              <span className="text-xs text-gray-400">{group.frequency}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                <h2 className="text-base font-semibold mb-4">Financial Summary</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Savings Rate", value: totalIn > 0 ? `${Math.round(((totalIn - totalOut) / totalIn) * 100)}%` : "0%" },
                    { label: "Total Transactions", value: transactions.length.toString() },
                    { label: "Groups Active", value: groups.length.toString() },
                    { label: "Trust Score", value: `${user?.trustScore || 100}%` },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/20 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold">{item.value}</div>
                      <div className="text-emerald-100 text-xs mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}