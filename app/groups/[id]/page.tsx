"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  ChevronLeft, Copy, Trash2, UserMinus, CheckCircle,
  Clock, Zap, Crown, MessageSquare, UserCheck, UserX,
  ArrowUp, ArrowDown, Pin, Megaphone, Plus
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
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [pinAnnouncement, setPinAnnouncement] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    if (token) {
      fetch("/api/groups", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const found = data.groups.find((g: any) => g.id === groupId);
            setGroup(found);
            if (found?.myRole === "admin") {
              fetch(`/api/groups/request?groupId=${groupId}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
                .then((res) => res.json())
                .then((reqData) => {
                  if (reqData.success) setJoinRequests(reqData.requests);
                });
            }
          }
          setLoading(false);
        });

      fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setContributions(data.transactions.filter((t: any) => t.groupId === groupId));
          }
        });

      fetch(`/api/announcements?groupId=${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setAnnouncements(data.announcements);
        });
    }
  }, [groupId]);

  const isAdmin = group?.myRole === "admin";

  const handlePostAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupId, message: newAnnouncement, isPinned: pinAnnouncement }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements([data.announcement, ...announcements]);
        setNewAnnouncement("");
        setPinAnnouncement(false);
        setShowAnnouncementForm(false);
      } else {
        alert(data.error || "Failed to post announcement");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const handleTogglePin = async (announcementId: string, currentPin: boolean) => {
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    try {
      const res = await fetch("/api/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ announcementId, isPinned: !currentPin }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(announcements.map((a) =>
          a.id === announcementId ? { ...a, isPinned: !currentPin } : a
        ));
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm("Delete this announcement?")) return;
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    try {
      const res = await fetch("/api/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ announcementId }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(announcements.filter((a) => a.id !== announcementId));
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const handleApproveRequest = async (requestId: string, action: string, userName: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    try {
      const res = await fetch("/api/groups/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setJoinRequests(joinRequests.filter((r) => r.id !== requestId));
        alert(`✅ ${userName} ${action === "approved" ? "approved" : "declined"}!`);
        if (action === "approved") window.location.reload();
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this group?`)) return;
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    try {
      const res = await fetch("/api/groups/member", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupId, memberId }),
      });
      const data = await res.json();
      if (data.success) {
        setGroup({ ...group, members: group.members.filter((m: any) => m.userId !== memberId) });
        alert(`✅ ${memberName} removed!`);
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm(`Delete "${group?.name}"? This cannot be undone.`)) return;
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    try {
      const res = await fetch("/api/groups/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Group deleted!");
        window.location.href = "/groups";
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const handleContribute = async () => {
    if (!confirm(`Contribute ₦${group?.contribution?.toLocaleString()} to ${group?.name}?`)) return;
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Contribution of ₦${data.amount?.toLocaleString()} successful!`);
        window.location.reload();
      } else {
        alert(data.error);
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const handleChangePayout = async (memberId: string, direction: "up" | "down") => {
    const members = [...group.members];
    const idx = members.findIndex((m: any) => m.userId === memberId);
    if (direction === "up" && idx > 0) {
      [members[idx], members[idx - 1]] = [members[idx - 1], members[idx]];
    } else if (direction === "down" && idx < members.length - 1) {
      [members[idx], members[idx + 1]] = [members[idx + 1], members[idx]];
    }
    const updated = members.map((m: any, i: number) => ({ ...m, payoutOrder: i + 1 }));
    setGroup({ ...group, members: updated });
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    await fetch("/api/groups/payout-order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ groupId, members: updated.map((m: any) => ({ userId: m.userId, payoutOrder: m.payoutOrder })) }),
    });
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

  const tabs = ["overview", "announcements", "members", "payout", "contributions"];
  if (isAdmin) tabs.splice(3, 0, "requests");

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
              <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl lg:text-2xl font-bold">{group.name}</h1>
                    {isAdmin && <Crown className="w-5 h-5 text-amber-300" />}
                  </div>
                  <p className="text-emerald-100 text-sm">{group.members?.length} members · {group.frequency} · ₦{group.contribution?.toLocaleString()}/cycle</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {joinRequests.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {joinRequests.length} pending
                    </span>
                  )}
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">{group.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={handleContribute}
                  className="bg-white text-emerald-600 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Contribute ₦{group.contribution?.toLocaleString()}
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(group.inviteCode); alert("✅ Invite code copied!"); }}
                  className="bg-white/20 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors flex items-center gap-1.5">
                  <Copy className="w-4 h-4" /> {group.inviteCode}
                </button>
                <a href="/chat"
                  className="bg-white/20 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Chat
                </a>
                {isAdmin && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Process payout to ${group.members?.[0]?.user?.fullName}?`)) return;
                      const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
                      const res = await fetch("/api/payout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ groupId }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert(`✅ ${data.message}`);
                        window.location.reload();
                      } else {
                        alert(data.error);
                      }
                    }}
                    className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Process Payout
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors capitalize relative ${activeTab === tab ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"}`}>
                {tab === "payout" ? "Payout" : tab === "requests" ? "Requests" : tab === "contributions" ? "Contributions" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "requests" && joinRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {joinRequests.length}
                  </span>
                )}
                {tab === "announcements" && announcements.filter((a) => a.isPinned).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-white text-xs flex items-center justify-center">
                    📌
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
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

              {/* Pinned Announcements on Overview */}
              {announcements.filter((a) => a.isPinned).length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-amber-700">Pinned Announcements</h3>
                  </div>
                  <div className="space-y-2">
                    {announcements.filter((a) => a.isPinned).map((ann: any, i: number) => (
                      <div key={i} className="bg-white rounded-xl p-3">
                        <p className="text-sm text-gray-700">{ann.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {ann.user?.fullName} · {new Date(ann.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === "announcements" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Group Announcements</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Important updates from group admin</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Post
                  </button>
                )}
              </div>

              {/* Post Form */}
              {isAdmin && showAnnouncementForm && (
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <textarea
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder="Write your announcement here..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 text-sm resize-none" />
                  <div className="flex items-center justify-between mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pinAnnouncement}
                        onChange={(e) => setPinAnnouncement(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500" />
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Pin className="w-3.5 h-3.5 text-amber-500" /> Pin this announcement
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => { setShowAnnouncementForm(false); setNewAnnouncement(""); }}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                        Cancel
                      </button>
                      <button onClick={handlePostAnnouncement}
                        disabled={!newAnnouncement.trim()}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                        <Megaphone className="w-4 h-4" /> Post Announcement
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="divide-y divide-gray-50">
                {announcements.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Megaphone className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                    <p className="font-medium text-gray-500">No announcements yet</p>
                    <p className="text-sm">{isAdmin ? "Post an announcement to notify all members" : "Admin hasn't posted any announcements yet"}</p>
                  </div>
                ) : (
                  announcements.map((ann: any, i: number) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 ${ann.isPinned ? "bg-amber-50/50" : ""}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ann.isPinned ? "bg-amber-100" : "bg-emerald-100"}`}>
                            {ann.isPinned
                              ? <Pin className="w-5 h-5 text-amber-500" />
                              : <Megaphone className="w-5 h-5 text-emerald-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            {ann.isPinned && (
                              <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium mb-2 inline-block">
                                📌 Pinned
                              </span>
                            )}
                            <p className="text-sm text-gray-800 leading-relaxed">{ann.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {ann.user?.fullName} · {new Date(ann.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleTogglePin(ann.id, ann.isPinned)}
                              title={ann.isPinned ? "Unpin" : "Pin"}
                              className={`p-1.5 rounded-lg transition-colors ${ann.isPinned ? "text-amber-500 bg-amber-50 hover:bg-amber-100" : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"}`}>
                              <Pin className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Members ({group.members?.length})</h2>
                {isAdmin && (
                  <button onClick={handleDeleteGroup}
                    className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete Group
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-50">
                {group.members?.map((member: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                      {member.user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{member.user?.fullName}</span>
                        {member.role === "admin" && (
                          <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Admin
                          </span>
                        )}
                        {member.userId === user?.id && (
                          <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">You</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{member.user?.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">
                        Trust: {member.user?.trustScore || 100}%
                      </span>
                      {isAdmin && member.userId !== user?.id && (
                        <button onClick={() => handleRemoveMember(member.userId, member.user?.fullName)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Join Requests Tab */}
          {activeTab === "requests" && isAdmin && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Join Requests ({joinRequests.length})</h2>
                <p className="text-xs text-gray-400 mt-1">Review and approve members who want to join</p>
              </div>
              {joinRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                  <p className="text-sm font-medium text-gray-500">No pending requests</p>
                  <p className="text-xs">Share your invite code to get members</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {joinRequests.map((request: any, i: number) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 px-6 py-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {request.user?.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{request.user?.fullName}</div>
                        <div className="text-xs text-gray-400">{request.user?.email}</div>
                        <div className="text-xs text-emerald-500 mt-0.5">Trust Score: {request.user?.trustScore || 100}%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveRequest(request.id, "approved", request.user?.fullName)}
                          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors">
                          <UserCheck className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleApproveRequest(request.id, "rejected", request.user?.fullName)}
                          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-500 px-3 py-2 rounded-xl text-xs font-medium transition-colors">
                          <UserX className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payout Tab */}
          {activeTab === "payout" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Payout Rotation</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {isAdmin ? "Use arrows to reorder payout sequence" : "Members receive payout in this order"}
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {group.members?.sort((a: any, b: any) => a.payoutOrder - b.payoutOrder).map((member: any, i: number) => {
                  const isCurrentUser = member.userId === user?.id;
                  const isPaid = i === 0;
                  const isNext = i === 1;
                  const totalPot = (group.contribution || 0) * (group.members?.length || 1);
                  return (
                    <div key={i} className={`flex items-center gap-4 px-6 py-4 ${isNext ? "bg-amber-50" : ""}`}>
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                        {isPaid ? <CheckCircle className="w-6 h-6 text-emerald-500" />
                          : isNext ? <Zap className="w-6 h-6 text-amber-500" />
                          : <Clock className="w-6 h-6 text-gray-300" />}
                      </div>
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm flex-shrink-0">
                        {member.user?.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{member.user?.fullName}</span>
                          {isCurrentUser && <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">You</span>}
                        </div>
                        <div className="text-xs text-gray-400">Position #{member.payoutOrder}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <div className="text-sm font-semibold text-gray-900">₦{totalPot.toLocaleString()}</div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${isPaid ? "bg-emerald-100 text-emerald-600" : isNext ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
                            {isPaid ? "Paid" : isNext ? "Next Up" : "Waiting"}
                          </span>
                        </div>
                        {isAdmin && (
                          <div className="flex flex-col gap-1">
                            <button onClick={() => handleChangePayout(member.userId, "up")}
                              disabled={i === 0}
                              className="p-1 text-gray-400 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleChangePayout(member.userId, "down")}
                              disabled={i === group.members.length - 1}
                              className="p-1 text-gray-400 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contributions Tab */}
          {activeTab === "contributions" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Contribution Tracking</h2>
                <p className="text-xs text-gray-400 mt-1">See who has contributed to this group</p>
              </div>
              <div className="divide-y divide-gray-50">
                {group.members?.map((member: any, i: number) => {
                  const memberContributions = contributions.filter((t: any) => t.userId === member.userId);
                  const totalContributed = memberContributions.reduce((sum: number, t: any) => sum + t.amount, 0);
                  const hasContributed = totalContributed > 0;
                  return (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {member.user?.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{member.user?.fullName}</span>
                          {member.userId === user?.id && (
                            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{memberContributions.length} contributions</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">₦{totalContributed.toLocaleString()}</div>
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${hasContributed ? "bg-emerald-100 text-emerald-600" : "bg-red-50 text-red-400"}`}>
                          {hasContributed ? "Contributing" : "No contributions"}
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