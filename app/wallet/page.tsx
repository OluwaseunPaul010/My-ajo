"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  ArrowUpRight, ArrowDownLeft, Plus, CreditCard, Building
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups" },
  { icon: Wallet, label: "Wallet", href: "/wallet", active: true },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
 { icon: Bell, label: "Reminders", href: "/reminders" },
{ icon: MessageCircle, label: "Messages", href: "/chat" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Shield, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const transactions = [
  { type: "credit", desc: "Payout Received", group: "Family Ajo", amount: "+₦200,000", date: "May 15, 2025", status: "completed" },
  { type: "debit", desc: "Contribution", group: "Market Women Ajo", amount: "-₦16,000", date: "May 10, 2025", status: "completed" },
  { type: "credit", desc: "Wallet Funding", group: "Bank Transfer", amount: "+₦50,000", date: "Apr 28, 2025", status: "completed" },
  { type: "debit", desc: "Contribution", group: "Family Ajo", amount: "-₦20,000", date: "May 1, 2025", status: "completed" },
  { type: "debit", desc: "Contribution", group: "Office Savings", amount: "-₦10,000", date: "Apr 25, 2025", status: "pending" },
  { type: "credit", desc: "Referral Bonus", group: "My Ajo", amount: "+₦5,000", date: "Apr 20, 2025", status: "completed" },
];

export default function WalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
const [realTransactions, setRealTransactions] = useState<any[]>([]);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    fetch("/api/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setWalletBalance(data.user.wallet?.balance || 0);
          setRealTransactions(data.user.transactions || []);
        }
      });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get("reference");
  const trxref = urlParams.get("trxref");
  const ref = reference || trxref;

  if (ref) {
    fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: ref }),
    })
      .then((res) => res.json())
     .then((data) => {
  if (data.success) {
    alert(`✅ Wallet funded! ₦${data.amount} added!`);
    window.history.replaceState({}, "", "/wallet");
    window.location.reload();
  } else {
    alert("Payment verification failed: " + (data.message || data.error));
  }
});
  }
}, []);

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get("reference");
  const trxref = urlParams.get("trxref");
  const ref = reference || trxref;

  if (ref) {
    fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: ref }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(`✅ Wallet funded! ₦${data.amount} added successfully!`);
          window.history.replaceState({}, "", "/wallet");
          window.location.reload();
        } else {
          alert("Payment verification failed: " + data.error);
        }
      })
      .catch((err) => {
        console.error("Verify error:", err);
      });
  }
}, []);

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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Wallet</h1>
            <p className="text-sm text-gray-500">Manage your funds and transactions</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">

          {/* Wallet Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Available Balance</p>
                  <h2 className="text-4xl font-bold">₦{walletBalance.toLocaleString()}.00</h2>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFundModal(true)}
                  className="bg-white text-emerald-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Fund Wallet
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-white/20 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4" /> Withdraw
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Funded", value: "₦1,500,000", icon: ArrowDownLeft, color: "text-emerald-500 bg-emerald-100" },
              { label: "Total Withdrawn", value: "₦850,000", icon: ArrowUpRight, color: "text-red-400 bg-red-50" },
              { label: "Total Contributions", value: "₦1,250,000", icon: TrendingUp, color: "text-blue-500 bg-blue-50" },
            ].map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Transaction History</h2>
              </div>
              <div className="flex gap-2">
                {["all", "credit", "debit"].map((tab) => (
                  <button key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {tab === "all" ? "All" : tab === "credit" ? "Money In" : "Money Out"}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {transactions
                .filter(tx => activeTab === "all" || tx.type === activeTab)
                .map((tx, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-100" : "bg-red-50"}`}>
                      {tx.type === "credit"
                        ? <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                        : <ArrowUpRight className="w-5 h-5 text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{tx.desc}</div>
                      <div className="text-xs text-gray-400">{tx.group} · {tx.date}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${tx.type === "credit" ? "text-emerald-500" : "text-red-400"}`}>{tx.amount}</div>
                      <div className={`text-xs ${tx.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>{tx.status}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </main>
      </div>

      {/* Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Fund Wallet</h3>
              <button onClick={() => setShowFundModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₦0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["5,000", "10,000", "20,000", "50,000", "100,000", "200,000"].map((val) => (
                  <button key={val}
                    onClick={() => setAmount(val.replace(",", ""))}
                    className="py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-500 transition-colors">
                    ₦{val}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="space-y-2">
                  {[
                    { icon: CreditCard, label: "Debit/Credit Card" },
                    { icon: Building, label: "Bank Transfer" },
                  ].map((method, i) => (
                    <button key={i} className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-emerald-500 transition-colors">
                      <method.icon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
             <button
  onClick={async () => {
    const token = localStorage.getItem("token");
    if (!token || !amount) return;
    try {
      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.authorizationUrl;
      } else {
        alert(data.error || "Payment failed");
      }
    } catch {
      alert("Something went wrong");
    }
  }}
  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors">
  Proceed to Pay with Paystack
</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="text-xs text-emerald-600 mb-1">Available Balance</div>
                <div className="text-2xl font-bold text-emerald-600">₦125,000.00</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Withdraw</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₦0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                <div className="p-3 border border-gray-200 rounded-xl flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Access Bank</div>
                    <div className="text-xs text-gray-400">0123456789 · Chioma Okafor</div>
                  </div>
                </div>
              </div>
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors">
                Withdraw Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}