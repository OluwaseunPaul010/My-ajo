"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Users, Wallet, TrendingUp, Bell, Shield,
  Menu, X, LogOut, AlertCircle, CheckCircle,
  Ban, Eye, Search, BarChart3, Settings,
  ArrowUpRight, ArrowDownLeft, Flag
} from "lucide-react";

const navItems = [
  { icon: BarChart3, label: "Overview", active: true },
  { icon: Users, label: "Users" },
  { icon: Shield, label: "Groups" },
  { icon: Wallet, label: "Transactions" },
  { icon: AlertCircle, label: "Fraud Monitor" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
];

const users = [
  { name: "Chioma Okafor", email: "chioma@example.com", phone: "08012345678", status: "active", groups: 3, balance: "₦125,000", verified: true },
  { name: "Tunde Adeyemi", email: "tunde@example.com", phone: "08087654321", status: "active", groups: 2, balance: "₦89,000", verified: true },
  { name: "Emeka Nwosu", email: "emeka@example.com", phone: "08055512345", status: "suspended", groups: 1, balance: "₦12,000", verified: false },
  { name: "Adesola Bankole", email: "adesola@example.com", phone: "08033345678", status: "active", groups: 4, balance: "₦234,000", verified: true },
  { name: "Ngozi Eze", email: "ngozi@example.com", phone: "08099912345", status: "pending", groups: 0, balance: "₦0", verified: false },
];

const transactions = [
  { user: "Chioma Okafor", type: "credit", desc: "Payout Received", amount: "₦200,000", date: "May 15", status: "completed", flag: false },
  { user: "Tunde Adeyemi", type: "debit", desc: "Contribution", amount: "₦20,000", date: "May 14", status: "completed", flag: false },
  { user: "Emeka Nwosu", type: "credit", desc: "Wallet Funding", amount: "₦500,000", date: "May 13", status: "flagged", flag: true },
  { user: "Adesola Bankole", type: "debit", desc: "Withdrawal", amount: "₦150,000", date: "May 12", status: "completed", flag: false },
  { user: "Ngozi Eze", type: "credit", desc: "Wallet Funding", amount: "₦50,000", date: "May 11", status: "pending", flag: false },
];

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
              <button key={i} onClick={() => setActiveNav(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeNav === item.label ? "bg-emerald-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
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
              <button className="text-gray-400 hover:text-red-400 transition-colors">
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
          <div className="ml-auto">
            <span className="text-xs bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-medium">● System Online</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", value: "48,293", change: "+234 today", icon: Users, color: "bg-emerald-100 text-emerald-500" },
              { label: "Active Groups", value: "1,247", change: "+18 today", icon: Shield, color: "bg-blue-50 text-blue-500" },
              { label: "Total Volume", value: "₦580M+", change: "+₦2.4M today", icon: TrendingUp, color: "bg-amber-50 text-amber-500" },
              { label: "Flagged Txns", value: "3", change: "Needs review", icon: AlertCircle, color: "bg-red-50 text-red-500" },
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Platform Health</h2>
              <div className="space-y-4">
                {[
                  { label: "System Uptime", value: "99.9%", color: "bg-emerald-500", percent: 99 },
                  { label: "Payment Success Rate", value: "98.7%", color: "bg-blue-500", percent: 98 },
                  { label: "User Satisfaction", value: "96.2%", color: "bg-amber-500", percent: 96 },
                  { label: "Contribution Rate", value: "92.1%", color: "bg-purple-500", percent: 92 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Today&apos;s Activity</h2>
              <div className="space-y-3">
                {[
                  { icon: Users, label: "New Registrations", value: "234", color: "bg-emerald-100 text-emerald-500" },
                  { icon: Shield, label: "New Groups Created", value: "18", color: "bg-blue-50 text-blue-500" },
                  { icon: ArrowDownLeft, label: "Total Deposits", value: "₦12.4M", color: "bg-emerald-100 text-emerald-500" },
                  { icon: ArrowUpRight, label: "Total Withdrawals", value: "₦8.2M", color: "bg-red-50 text-red-500" },
                  { icon: Bell, label: "Reminders Sent", value: "1,847", color: "bg-amber-50 text-amber-500" },
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

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Fraud Alerts</h2>
                <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded-full font-medium">3 Active</span>
              </div>
              <div className="space-y-3">
                {[
                  { user: "Emeka Nwosu", issue: "Unusual large deposit (₦500K)", severity: "high", time: "2h ago" },
                  { user: "Unknown IP", issue: "Multiple failed login attempts", severity: "medium", time: "4h ago" },
                  { user: "Bola Adeyemi", issue: "Rapid withdrawal pattern", severity: "low", time: "6h ago" },
                ].map((alert, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${alert.severity === "high" ? "bg-red-50 border-red-200" : alert.severity === "medium" ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{alert.user}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${alert.severity === "high" ? "bg-red-100 text-red-600" : alert.severity === "medium" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{alert.issue}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">User Management</h2>
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
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Groups</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Balance</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((user, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-xs">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                              {user.name}
                              {user.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                            </div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.groups}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.balance}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.status === "active" ? "bg-emerald-100 text-emerald-600" : user.status === "suspended" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Eye className="w-4 h-4" /></button>
                          <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Ban className="w-4 h-4" /></button>
                          <button className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"><Flag className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Transaction Monitoring</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Description</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx, i) => (
                    <tr key={i} className={`hover:bg-gray-50 transition-colors ${tx.flag ? "bg-red-50" : ""}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.user}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-100" : "bg-red-50"}`}>
                            {tx.type === "credit" ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />}
                          </div>
                          <span className="text-sm text-gray-600">{tx.desc}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${tx.type === "credit" ? "text-emerald-500" : "text-red-400"}`}>{tx.amount}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{tx.date}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${tx.status === "completed" ? "bg-emerald-100 text-emerald-600" : tx.status === "flagged" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Eye className="w-4 h-4" /></button>
                          {tx.flag && <button className="p-1.5 text-red-400 hover:text-red-600 transition-colors"><Flag className="w-4 h-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}