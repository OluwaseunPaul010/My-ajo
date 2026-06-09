"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  Plus, Trophy, Calendar, CheckCircle
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
{ icon: MessageCircle, label: "Messages", href: "/chat" },
  { icon: Target, label: "Goals", href: "/goals", active: true },
  { icon: Shield, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function GoalsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ title: "", targetAmount: "", deadline: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/goals", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setGoals(data.goals);
        });
    }
  }, []);

  const createGoal = async () => {
    const token = localStorage.getItem("token");
    if (!token || !form.title || !form.targetAmount) return;
    setLoading(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setGoals([data.goal, ...goals]);
        setShowModal(false);
        setForm({ title: "", targetAmount: "", deadline: "" });
      } else {
        alert(data.error || "Failed to create goal");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completed = goals.filter((g) => g.savedAmount >= g.targetAmount).length;

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
                  document.cookie = "token=; path=/; max-age=0";
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
            <h1 className="text-lg font-bold text-gray-900">Savings Goals</h1>
            <p className="text-sm text-gray-500">Track and achieve your financial goals</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Goal
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Goals", value: goals.length.toString(), icon: Target, color: "bg-emerald-100 text-emerald-500" },
              { label: "Total Saved", value: `₦${totalSaved.toLocaleString()}`, icon: Wallet, color: "bg-blue-50 text-blue-500" },
              { label: "Completed", value: completed.toString(), icon: Trophy, color: "bg-amber-50 text-amber-500" },
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

          {/* Overall Progress */}
          {goals.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">Overall Progress</h2>
                  <p className="text-emerald-100 text-sm">Keep saving to reach your goals!</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₦{totalSaved.toLocaleString()}</div>
                  <div className="text-emerald-100 text-sm">of ₦{totalTarget.toLocaleString()}</div>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-white h-3 rounded-full transition-all"
                  style={{ width: `${totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0}%` }} />
              </div>
              <div className="text-emerald-100 text-sm mt-2">
                {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}% of total target reached
              </div>
            </div>
          )}

          {/* Goals Grid */}
          {goals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-emerald-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No goals yet!</h3>
              <p className="text-gray-400 text-sm mb-6">Create your first savings goal and start working towards it.</p>
              <button onClick={() => setShowModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal: any, i: number) => {
                const percent = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
                const isCompleted = goal.savedAmount >= goal.targetAmount;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        {isCompleted ? <Trophy className="w-5 h-5 text-amber-500" /> : <Target className="w-5 h-5 text-emerald-500" />}
                      </div>
                      {isCompleted && (
                        <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Completed!
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{goal.title}</h3>
                    {goal.deadline && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                        <Calendar className="w-3 h-3" />
                        <span>Target: {new Date(goal.deadline).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    )}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">₦{goal.savedAmount.toLocaleString()} saved</span>
                        <span className="font-semibold text-emerald-500">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${isCompleted ? "bg-amber-400" : "bg-emerald-500"}`}
                          style={{ width: `${percent}%` }} />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Target: ₦{goal.targetAmount.toLocaleString()}</div>
                    </div>
                {goal.savedAmount >= goal.targetAmount && goal.status !== "withdrawn" ? (
  <div className="space-y-2">
    <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
      <div className="text-emerald-600 font-semibold text-sm">🎉 Goal Completed!</div>
      <div className="text-xs text-emerald-500 mt-0.5">Ready to withdraw to wallet</div>
    </div>
    <button
      onClick={async () => {
        if (!confirm(`Withdraw ₦${goal.savedAmount.toLocaleString()} to your wallet?`)) return;
        const token = localStorage.getItem("token");
        try {
          const res = await fetch("/api/goals/withdraw", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ goalId: goal.id }),
          });
          const data = await res.json();
          if (data.success) {
            alert(`✅ ₦${data.amount.toLocaleString()} withdrawn to your wallet!`);
            setGoals(goals.map((g) => g.id === goal.id ? { ...g, status: "withdrawn" } : g));
          } else {
            alert(data.error || "Failed to withdraw");
          }
        } catch {
          alert("Something went wrong");
        }
      }}
      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
      💰 Withdraw to Wallet
    </button>
  </div>
) : goal.status === "withdrawn" ? (
  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
    <div className="text-gray-500 font-medium text-sm">✅ Withdrawn to Wallet</div>
    <div className="text-xs text-gray-400 mt-0.5">This goal has been completed</div>
  </div>
) : (
  <button
    onClick={async () => {
      const amount = prompt("Enter amount to save towards this goal (₦):");
      if (!amount || isNaN(parseFloat(amount))) return;
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/goals", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ goalId: goal.id, amount: parseFloat(amount) }),
        });
        const data = await res.json();
        if (data.success) {
          setGoals(goals.map((g) => g.id === goal.id ? data.goal : g));
          alert(`✅ ₦${parseFloat(amount).toLocaleString()} saved towards "${goal.title}"!`);
        } else {
          alert(data.error || "Failed to add savings");
        }
      } catch {
        alert("Something went wrong");
      }
    }}
    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-2 rounded-xl text-sm font-medium transition-colors">
    + Add Savings
  </button>
)}
                  </motion.div>
                );
              })}

              {/* Add New Goal Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowModal(true)}
                className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-300 p-8 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-md group">
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-600 group-hover:text-emerald-500">Add New Goal</div>
                  <div className="text-xs text-gray-400 mt-1">Set a new savings target</div>
                </div>
              </motion.button>
            </div>
          )}
        </main>
      </div>

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Create Savings Goal</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                <input type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. New Laptop, Business Capital"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (₦)</label>
                <input type="number" value={form.targetAmount}
                  onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                  placeholder="e.g. 500000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date (Optional)</label>
                <input type="date" value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
              </div>
              <button onClick={createGoal} disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Create Goal</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}