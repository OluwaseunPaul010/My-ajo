"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  ChevronLeft, Copy, Trash2, UserMinus, CheckCircle,
  Clock, Zap, Crown, MessageSquare
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups", active: true },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
  { icon: MessageCircle, label: "Messages", href: "/chat" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Shield, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/groups", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const found = data.groups.find((g: any) => g.id === groupId);
            setGroup(found);
          }
          setLoading(false);
        });
    }
  }, [groupId]);

  const isAdmin = group?.myRole === "admin";

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this group?`)) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/groups/member", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId, memberId }),
      });
      const data = await res.json();
      if (data.success) {
        setGroup({
          ...group,
          members: group.members.filter((m: any) => m.userId !== memberId),
        });
        alert(`✅ ${memberName} removed from group`);
      } else {
        alert(data.error || "Failed to remove member");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm(`Are you sure you want to delete "${group?.name}"? This cannot be undone.`)) return;
    if (!confirm("This will permanently delete the group and all its data. Continue?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/groups/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Group deleted successfully");
        window.location.href = "/groups";
      } else {
        alert(data.error || "Failed to delete group");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const handleContribute = async () => {
    if (!confirm(`Contribute ₦${group?.contribution?.toLocaleString()} to ${group?.name}?`)) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Contribution of ₦${data.amount?.toLocaleString()} successful!`);
        window.location.reload();
      } else {
        alert(data.error || "Failed to contribute");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Group not found</p>
          <a href="/groups" className="text-emerald-500 hover:underline">← Back to Groups</a>
        </div>
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
                localStorage.removeItem("token");
                localStorage.removeItem("user");
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

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-40 lg:hidden" />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <a href="/groups" className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Groups</span>
          </a>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Group Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold">{group.name}</h1>
                    {isAdmin && <Crown className="w-5 h-5 text-amber-300" />}
                  </div>
                  <p className="text-emerald-100 text-sm">{group.members?.length} members · {group.frequency} · ₦{group.contribution?.toLocaleString()}/cycle</p>
                </div>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">{group.status}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleContribute}
                  className="bg-white text-emerald-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Contribute ₦{group.contribution?.toLocaleString()}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(group.inviteCode);
                    alert("✅ Invite code copied!");
                  }}
                  className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors flex items-center gap-2">
                  <Copy className="w-4 h-4" /> {group.inviteCode}
                </button>
                <a href="/chat"
                  className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Group Chat
                </a>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {["overview", "members", "payout"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${activeTab === tab ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"}`}>
                {tab === "payout" ? "Payout Rotation" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Members", value: group.members?.length || 0, icon: Users, color: "bg-emerald-100 text-emerald-500" },
                { label: "Contribution", value: `₦${group.contribution?.toLocaleString()}`, icon: Wallet, color: "bg-blue-50 text-blue-500" },
                { label: "Total Pot", value: `₦${((group.contribution || 0) * (group.members?.length || 1)).toLocaleString()}`, icon: TrendingUp, color: "bg-amber-50 text-amber-500" },
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
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Group Members ({group.members?.length})</h2>
                  {isAdmin && (
                    <button
                      onClick={handleDeleteGroup}
                      className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete Group
                    </button>
                  )}
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {group.members?.map((member: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                      {member.user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{member.user?.fullName}</span>
                        {member.role === "admin" && (
                          <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Admin
                          </span>
                        )}
                        {member.userId === user?.id && (
                          <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">You</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{member.user?.email}</div>
                    </div>
                    <div className="text-xs text-gray-400">Position #{member.payoutOrder}</div>
                    {isAdmin && member.userId !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.userId, member.user?.fullName)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payout Rotation Tab */}
          {activeTab === "payout" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Payout Rotation</h2>
                <p className="text-xs text-gray-400 mt-1">Members receive payout in the order they joined</p>
              </div>
              <div className="divide-y divide-gray-50">
                {group.members?.map((member: any, i: number) => {
                  const isCurrentUser = member.userId === user?.id;
                  const isPaid = i === 0;
                  const isNext = i === 1;
                  return (
                    <div key={i} className={`flex items-center gap-4 px-6 py-4 ${isNext ? "bg-amber-50" : ""}`}>
                      <div className="w-8 h-8 flex items-center justify-center">
                        {isPaid ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        ) : isNext ? (
                          <Zap className="w-6 h-6 text-amber-500" />
                        ) : (
                          <Clock className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm flex-shrink-0">
                        {member.user?.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{member.user?.fullName}</span>
                          {isCurrentUser && (
                            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">Position #{member.payoutOrder}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ₦{((group.contribution || 0) * (group.members?.length || 1)).toLocaleString()}
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${isPaid ? "bg-emerald-100 text-emerald-600" : isNext ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
                          {isPaid ? "Paid" : isNext ? "Next Up" : "Waiting"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}