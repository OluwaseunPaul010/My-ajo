"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  User, Lock, Eye, EyeOff, CheckCircle, Camera,
  AlertCircle, CreditCard
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
  { icon: Settings, label: "Settings", href: "/settings", active: true },
];

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [bvn, setBvn] = useState("");
  const [showVerifyInput, setShowVerifyInput] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: "", email: "", phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    contributions: true,
    payouts: true,
    reminders: true,
    groupActivity: true,
    marketing: false,
  });

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    fetch("/api/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setProfileForm({
            fullName: data.user.fullName || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
          });
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      });
  }
}, []);

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
            setProfileForm({
              fullName: data.user.fullName || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
            });
          }
        });
    }
  } [];

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError("");
    setTimeout(() => setSuccess(""), 3000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setSuccess("");
    setTimeout(() => setError(""), 3000);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify({ ...user, ...profileForm }));
        showSuccess("Profile updated successfully!");
      } else {
        showError(data.error || "Failed to update profile");
      }
    } catch {
      showError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError("Passwords do not match!");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Password updated successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showError(data.error || "Failed to update password");
      }
    } catch {
      showError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setShowVerifyInput(true);
        showSuccess("Verification code sent to your email!");
      } else {
        showError(data.error || "Failed to send code");
      }
    } catch {
      showError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
  setLoading(true);
  try {
    const res = await fetch("/api/auth/verify-email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id, token: verifyCode }),
    });
    const data = await res.json();
    if (data.success) {
      const updatedUser = { ...user, emailVerified: true };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowVerifyInput(false);
      setVerifyCode("");
      showSuccess("Email verified successfully! +5 trust points!");

      const token = localStorage.getItem("token");
      if (token) {
        fetch("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((freshData) => {
            if (freshData.success) {
              setUser(freshData.user);
              localStorage.setItem("user", JSON.stringify(freshData.user));
            }
          });
      }
    } else {
      showError(data.error || "Invalid code");
    }
  } catch {
    showError("Something went wrong");
  } finally {
    setLoading(false);
  }
};

 const handleBvnVerify = async () => {
  if (!bvn || bvn.length !== 11) {
    showError("BVN must be 11 digits");
    return;
  }
  setLoading(true);
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("/api/auth/verify-bvn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bvn }),
    });
    const data = await res.json();
    if (data.success) {
      const updatedUser = { ...user, bvnVerified: true, isVerified: true, kycStatus: "verified" };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      showSuccess("BVN verified! +10 trust points! Account fully verified!");
      setBvn("");

      if (token) {
        fetch("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((freshData) => {
            if (freshData.success) {
              setUser(freshData.user);
              localStorage.setItem("user", JSON.stringify(freshData.user));
            }
          });
      }
    } else {
      showError(data.error || "BVN verification failed");
    }
  } catch {
    showError("Something went wrong");
  } finally {
    setLoading(false);
  }
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
          <div>
            <h1 className="text-lg font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage your account preferences</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-emerald-700 font-medium">{success}</span>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "password", label: "Password", icon: Lock },
              { id: "verification", label: "Verification", icon: Shield },
              { id: "notifications", label: "Notifications", icon: Bell },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"}`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Profile Information</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {user?.fullName?.split(" ").map((n: string) => n[0]).join("") || "U"}
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center shadow-sm">
                    <Camera className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{user?.fullName}</div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user?.isVerified ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                      {user?.isVerified ? "✅ Verified" : "⚠️ Unverified"}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      Trust: {user?.trustScore || 100}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
                </div>
                <button onClick={handleProfileUpdate} disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 pr-12" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input type="password" value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
                </div>
                <button onClick={handlePasswordUpdate} disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Update Password"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Verification Tab */}
          {activeTab === "verification" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-6">

              {/* Verification Status */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Verification Status</h2>
                <div className="space-y-3">
                  {[
                    { label: "Email Verification", status: user?.emailVerified, desc: "Verify your email address" },
                    { label: "BVN Verification", status: user?.bvnVerified, desc: "Verify your Bank Verification Number" },
                    { label: "Account Verified", status: user?.isVerified, desc: "Full account verification" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 p-4 rounded-xl ${item.status ? "bg-emerald-50" : "bg-gray-50"}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status ? "bg-emerald-100" : "bg-gray-200"}`}>
                        {item.status ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-400">{item.desc}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.status ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                        {item.status ? "Verified" : "Not Verified"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Verification */}
              {!user?.emailVerified && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-2">Verify Email</h2>
                  <p className="text-sm text-gray-500 mb-4">Verify your email to increase your trust score by 5 points</p>
                  {!showVerifyInput ? (
                    <button onClick={handleSendVerification} disabled={loading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-xl font-semibold transition-colors">
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : "Send Verification Code"}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <input type="text" value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 text-center text-2xl font-mono tracking-widest" />
                      <button onClick={handleVerifyEmail} disabled={loading || verifyCode.length !== 6}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-xl font-semibold transition-colors">
                        Verify Email
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* BVN Verification */}
              {!user?.bvnVerified && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-2">Verify BVN</h2>
                  <p className="text-sm text-gray-500 mb-4">Verify your BVN to get full account verification and +10 trust points</p>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                    <p className="text-xs text-amber-700">🔒 Your BVN is encrypted and never shared with third parties. It is only used for identity verification.</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">BVN Number</label>
                      <input type="text" value={bvn}
                        onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))}
                        placeholder="Enter your 11-digit BVN"
                        maxLength={11}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 text-center text-xl font-mono tracking-widest" />
                    </div>
                    <button onClick={handleBvnVerify} disabled={loading || bvn.length !== 11}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CreditCard className="w-4 h-4" /> Verify BVN</>}
                    </button>
                  </div>
                </div>
              )}

              {user?.bvnVerified && user?.emailVerified && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-emerald-700">Fully Verified! 🎉</h3>
                  <p className="text-sm text-emerald-600 mt-1">Your account is fully verified. You have access to all features!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: "contributions", label: "Contribution Reminders", desc: "Get reminded when contributions are due" },
                  { key: "payouts", label: "Payout Alerts", desc: "Get notified when payouts are processed" },
                  { key: "reminders", label: "Smart Reminders", desc: "Receive intelligent savings reminders" },
                  { key: "groupActivity", label: "Group Activity", desc: "Updates about your group members" },
                  { key: "marketing", label: "Promotions & Updates", desc: "News and promotional offers from My Ajo" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? "bg-emerald-500" : "bg-gray-300"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors">
                  Save Preferences
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}