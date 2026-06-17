"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  ArrowUpRight, ArrowDownLeft, Search, Filter
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions", active: true },
  { icon: Bell, label: "Reminders", href: "/reminders" },
{ icon: MessageCircle, label: "Messages", href: "/chat" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Shield, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function TransactionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = sessionStorage.getItem("token");
    if (token) {
      fetch("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setTransactions(data.transactions);
            setFiltered(data.transactions);
            setTotalIn(data.totalIn);
            setTotalOut(data.totalOut);
          }
        });
    }
  }, []);

  useEffect(() => {
    let result = transactions;
    if (activeTab !== "all") {
      result = result.filter((tx) => tx.type === activeTab);
    }
    if (search) {
      result = result.filter((tx) =>
        tx.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [activeTab, search, transactions]);

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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-500">Your complete transaction history</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Money In", value: `₦${totalIn.toLocaleString()}`, icon: ArrowDownLeft, color: "bg-emerald-100 text-emerald-500" },
              { label: "Total Money Out", value: `₦${totalOut.toLocaleString()}`, icon: ArrowUpRight, color: "bg-red-50 text-red-500" },
              { label: "Total Transactions", value: transactions.length.toString(), icon: TrendingUp, color: "bg-blue-50 text-blue-500" },
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

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900" />
                </div>
                <div className="flex gap-2">
                  {["all", "credit", "debit"].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${activeTab === tab ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {tab === "all" ? "All" : tab === "credit" ? "Money In" : "Money Out"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                  <p className="font-medium text-gray-600">No transactions yet!</p>
                  <p className="text-sm">Fund your wallet to get started.</p>
                </div>
              ) : (
                filtered.map((tx: any, i: number) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-100" : "bg-red-50"}`}>
                      {tx.type === "credit"
                        ? <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                        : <ArrowUpRight className="w-5 h-5 text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{tx.description}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${tx.type === "credit" ? "text-emerald-500" : "text-red-400"}`}>
                        {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                      </div>
                      <div className={`text-xs ${tx.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>
                        {tx.status}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}