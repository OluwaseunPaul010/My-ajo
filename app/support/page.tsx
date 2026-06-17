"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  ChevronRight, ChevronDown, Phone, Mail, CheckCircle
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
{ icon: MessageCircle, label: "Messages", href: "/chat" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Shield, label: "Support", href: "/support", active: true },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const faqs = [
  { q: "What is Ajo?", a: "Ajo (also called Esusu or Thrift) is a traditional Nigerian group savings system where members contribute a fixed amount regularly and each member receives the total pot in rotation." },
  { q: "Is my money safe on My Ajo?", a: "Yes! We use bank-level encryption, two-factor authentication and are licensed by the CBN. Your funds are always protected and secured." },
  { q: "How do I receive my payout?", a: "Payouts are sent directly to your My Ajo wallet instantly when it's your turn. You can then withdraw to your bank account at any time." },
  { q: "Can I create my own group?", a: "Yes! You can create a group, invite members, set contribution amounts and define the payout rotation order easily from your dashboard." },
  { q: "What happens if someone misses a contribution?", a: "Members receive multiple reminders. If a payment is missed, the admin is notified and the group can decide on next steps based on group rules." },
  { q: "How do I withdraw my funds?", a: "Go to Wallet → Withdraw, enter the amount and your bank details. Withdrawals are processed within 24 hours on business days." },
  { q: "How do I invite friends to my group?", a: "Go to My Groups, click on your group and share the unique invite code with your friends. They can join using that code." },
  { q: "What payment methods are supported?", a: "We support debit/credit cards and bank transfers via Paystack. More payment methods are coming soon." },
];

export default function SupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("faq");
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleContact = () => {
    if (!contactForm.subject || !contactForm.message) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setContactForm({ subject: "", message: "" });
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
            <h1 className="text-lg font-bold text-gray-900">Support & Help</h1>
            <p className="text-sm text-gray-500">We&apos;re here to help you</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Phone, label: "Call Us", value: "0700 123 4567", desc: "Mon-Fri, 8am-6pm", color: "bg-emerald-100 text-emerald-500" },
              { icon: Mail, label: "Email Us", value: "support@myajo.com", desc: "Response within 24hrs", color: "bg-blue-50 text-blue-500" },
              { icon: MessageCircle, label: "Live Chat", value: "Chat Now", desc: "Available 24/7", color: "bg-amber-50 text-amber-500" },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                <div className="text-sm text-emerald-500 font-medium mt-1">{item.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {["faq", "contact"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${activeTab === tab ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"}`}>
                {tab === "faq" ? "FAQs" : "Contact Us"}
              </button>
            ))}
          </div>

          {/* FAQ Tab */}
          {activeTab === "faq" && (
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                    {openFaq === i
                      ? <ChevronDown className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="px-5 pb-5">
                      <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Send us a Message</h2>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900">
                      <option value="">Select a topic</option>
                      <option value="contribution">Contribution Issues</option>
                      <option value="payout">Payout & Withdrawals</option>
                      <option value="wallet">Wallet & Payments</option>
                      <option value="group">Groups & Members</option>
                      <option value="account">Account & Security</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={5}
                      placeholder="Describe your issue or question..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 resize-none" />
                  </div>
                  <button onClick={handleContact}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors">
                    Send Message
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}