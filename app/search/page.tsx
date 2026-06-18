"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  Search, ArrowDownLeft, ArrowUpRight
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

export default function SearchPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    if (token) {
      fetch("/api/groups", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => { if (data.success) setGroups(data.groups); });

      fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => { if (data.success) setTransactions(data.transactions); });

      fetch("/api/goals", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => { if (data.success) setGoals(data.goals); });
    }
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.name?.toLowerCase().includes(query.toLowerCase()) ||
    g.inviteCode?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTransactions = transactions.filter((t) =>
    t.description?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredGoals = goals.filter((g) =>
    g.title?.toLowerCase().includes(query.toLowerCase())
  );

  const totalResults = filteredGroups.length + filteredTransactions.length + filteredGoals.length;

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
            <h1 className="text-lg font-bold text-gray-900">Search</h1>
            <p className="text-sm text-gray-500">Search across your groups, transactions and goals</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groups, transactions, goals..."
              autoFocus
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 text-base shadow-sm" />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {["all", "groups", "transactions", "goals"].map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${activeFilter === filter ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"}`}>
                {filter === "all" ? `All (${totalResults})` : filter}
              </button>
            ))}
          </div>

          {query === "" ? (
            <div className="text-center py-16 text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-4 text-emerald-300" />
              <p className="font-medium text-gray-500">Start typing to search</p>
              <p className="text-sm mt-1">Search across groups, transactions and goals</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-500">No results for &quot;{query}&quot;</p>
              <p className="text-sm mt-1">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Groups Results */}
              {(activeFilter === "all" || activeFilter === "groups") && filteredGroups.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Groups ({filteredGroups.length})</h2>
                  <div className="space-y-2">
                    {filteredGroups.map((group: any, i: number) => (
                      <motion.a key={i} href={`/groups/${group.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-semibold">
                          {group.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{group.name}</div>
                          <div className="text-xs text-gray-400">{group.members?.length || 1} members · ₦{group.contribution?.toLocaleString()}/cycle · {group.frequency}</div>
                        </div>
                        <span className="text-xs font-mono text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{group.inviteCode}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions Results */}
              {(activeFilter === "all" || activeFilter === "transactions") && filteredTransactions.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Transactions ({filteredTransactions.length})</h2>
                  <div className="space-y-2">
                    {filteredTransactions.map((tx: any, i: number) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-100" : "bg-red-50"}`}>
                          {tx.type === "credit"
                            ? <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                            : <ArrowUpRight className="w-5 h-5 text-red-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{tx.description}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                        <div className={`text-sm font-semibold ${tx.type === "credit" ? "text-emerald-500" : "text-red-400"}`}>
                          {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals Results */}
              {(activeFilter === "all" || activeFilter === "goals") && filteredGoals.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Goals ({filteredGoals.length})</h2>
                  <div className="space-y-2">
                    {filteredGoals.map((goal: any, i: number) => {
                      const percent = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
                      return (
                        <motion.a key={i} href="/goals"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all">
                          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Target className="w-5 h-5 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900">{goal.title}</div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-emerald-500">{percent}%</div>
                            <div className="text-xs text-gray-400">₦{goal.savedAmount?.toLocaleString()}</div>
                          </div>
                        </motion.a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}