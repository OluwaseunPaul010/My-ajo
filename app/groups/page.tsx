"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  Plus, Search, ChevronRight, Clock, CheckCircle
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups", active: true },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Reminders", href: "/reminders", badge: 2 },
  { icon: MessageCircle, label: "Messages", href: "/chat", badge: 3 },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Shield, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const groups = [
  {
    name: "Family Ajo",
    members: 10,
    contribution: "₦20,000",
    frequency: "Weekly",
    progress: 80,
    nextPayout: "May 15",
    totalPot: "₦200,000",
    myPosition: 2,
    status: "active",
    color: "emerald",
  },
  {
    name: "Market Women Ajo",
    members: 8,
    contribution: "₦16,000",
    frequency: "Weekly",
    progress: 60,
    nextPayout: "May 30",
    totalPot: "₦128,000",
    myPosition: 5,
    status: "active",
    color: "blue",
  },
  {
    name: "Office Savings",
    members: 5,
    contribution: "₦10,000",
    frequency: "Monthly",
    progress: 40,
    nextPayout: "Jun 10",
    totalPot: "₦50,000",
    myPosition: 3,
    status: "active",
    color: "purple",
  },
];

export default function GroupsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState("my");
  const [form, setForm] = useState({
    name: "", contribution: "", frequency: "weekly", maxMembers: ""
  });
  const [joinCode, setJoinCode] = useState("");

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
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">{item.badge}</span>
                )}
              </a>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">CO</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">Chioma Okafor</div>
                <div className="text-xs text-emerald-500">Premium Member</div>
              </div>
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
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
            <h1 className="text-lg font-bold text-gray-900">My Ajo Groups</h1>
            <p className="text-sm text-gray-500">Manage your savings circles</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="border border-emerald-500 text-emerald-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors">
              Join Group
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Group
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Active Groups", value: "3", icon: Users, color: "bg-emerald-100 text-emerald-500" },
              { label: "Total Saved", value: "₦1,250,000", icon: TrendingUp, color: "bg-blue-50 text-blue-500" },
              { label: "Next Payout", value: "In 2 days", icon: Clock, color: "bg-amber-50 text-amber-500" },
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
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {["my", "discover"].map((tab) => (
              <button key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"}`}>
                {tab === "my" ? "My Groups" : "Discover Groups"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900"
            />
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">

                {/* Card Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-lg font-medium">
                      {group.status}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{group.name}</h3>
                  <p className="text-emerald-100 text-sm">{group.members} members · {group.frequency}</p>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Contribution</div>
                      <div className="text-sm font-semibold text-gray-900">{group.contribution}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Total Pot</div>
                      <div className="text-sm font-semibold text-gray-900">{group.totalPot}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Next Payout</div>
                      <div className="text-sm font-semibold text-gray-900">{group.nextPayout}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">My Position</div>
                      <div className="text-sm font-semibold text-gray-900">#{group.myPosition}</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{group.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${group.progress}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a href="/chat"
                      className="flex-1 text-center py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-emerald-300 hover:text-emerald-500 transition-colors flex items-center justify-center gap-1">
                      <MessageCircle className="w-4 h-4" /> Chat
                    </a>
                    <button className="flex-1 text-center py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm text-white transition-colors flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Contribute
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Create New Group Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-300 p-8 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-md group">
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-600 group-hover:text-emerald-500 transition-colors">Create New Group</div>
                <div className="text-xs text-gray-400 mt-1">Start a new savings circle</div>
              </div>
            </motion.button>
          </div>
        </main>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Create Ajo Group</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Family Savings Circle"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contribution Amount</label>
                <input
                  type="number"
                  value={form.contribution}
                  onChange={(e) => setForm({ ...form, contribution: e.target.value })}
                  placeholder="₦0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contribution Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Members</label>
                <input
                  type="number"
                  value={form.maxMembers}
                  onChange={(e) => setForm({ ...form, maxMembers: e.target.value })}
                  placeholder="e.g. 10"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                />
              </div>
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Create Group
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Join Ajo Group</h3>
              <button onClick={() => setShowJoinModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl text-sm text-emerald-700">
                Enter the invite code shared by the group admin to join their savings circle.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invite Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="e.g. AJO-1234-WXYZ"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 text-center text-lg font-mono tracking-widest"
                />
              </div>
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                <ChevronRight className="w-4 h-4" /> Join Group
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}