"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, Users, Lock, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      const twoFARes = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const twoFAData = await twoFARes.json();

      if (twoFAData.required) {
        localStorage.setItem("temp_token", data.token);
        localStorage.setItem("temp_user", JSON.stringify(data.user));
        setStep("2fa");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `token=${data.token}; path=/; max-age=86400`;

      const onboarding = localStorage.getItem("onboarding_complete");
      window.location.href = onboarding ? "/dashboard" : "/onboarding";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: twoFACode }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Invalid code");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("temp_token");
      const user = localStorage.getItem("temp_user");

      localStorage.removeItem("temp_token");
      localStorage.removeItem("temp_user");
      localStorage.setItem("token", token || "");
      localStorage.setItem("user", user || "");
      document.cookie = `token=${token}; path=/; max-age=86400`;

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {step === "2fa" ? <ShieldCheck className="w-8 h-8 text-white" /> : <Users className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-2xl font-bold mb-1">
              {step === "2fa" ? "Two-Factor Auth" : "Welcome Back"}
            </h1>
            <p className="text-emerald-100 text-sm">
              {step === "2fa" ? `Enter the code sent to ${email}` : "Sign in to your My Ajo account"}
            </p>
          </div>

          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === "login" ? (
                <motion.form key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin}
                  className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type={showPassword ? "text" : "password"} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <a href="/auth/forgot-password" className="text-sm text-emerald-500 hover:text-emerald-600 font-medium">
                      Forgot password?
                    </a>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Sign In"}
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    Don&apos;t have an account?{" "}
                    <a href="/auth/register" className="text-emerald-500 hover:text-emerald-600 font-medium">Create one</a>
                  </p>
                </motion.form>
              ) : (
                <motion.form key="2fa"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerify2FA}
                  className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">6-Digit Code</label>
                    <input type="text" value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000" maxLength={6} required
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 text-center text-3xl font-mono tracking-widest" />
                    <p className="text-xs text-gray-400 text-center mt-2">Check your email for the 6-digit code</p>
                  </div>
                  <button type="submit" disabled={loading || twoFACode.length !== 6}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><ShieldCheck className="w-5 h-5" /> Verify & Login</>}
                  </button>
                  <button type="button" onClick={() => { setStep("login"); setTwoFACode(""); setError(""); }}
                    className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    ← Back to Login
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}