"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, TrendingUp, Bell, MessageCircle,
  Home, Settings, LogOut, Menu, X, Target, Shield,
  Phone, Mail, ChevronDown, ChevronRight, Send,
  Bot, User as UserIcon, BarChart3, Activity, Gift
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "My Groups", href: "/groups" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
  { icon: MessageCircle, label: "Messages", href: "/chat" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Gift, label: "Refer & Earn", href: "/referral" },
  { icon: Activity, label: "Activity Log", href: "/activity" },
  { icon: Shield, label: "Support", href: "/support", active: true },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const faqs = [
  {
    question: "What is Ajo?",
    answer: "Ajo (also known as Esusu or Thrift) is a traditional Nigerian rotating savings system where a group of people contribute a fixed amount regularly, and members take turns receiving the full pooled amount. My Ajo digitizes this trusted system with bank-level security and transparency.",
  },
  {
    question: "Is my money safe on My Ajo?",
    answer: "Yes! All funds are held securely in your personal wallet and all payments are processed through Paystack, a licensed and PCI-compliant payment processor. We also use JWT authentication, transaction PINs, 2FA, and encrypted BVN verification to protect your account.",
  },
  {
    question: "How do I receive my payout?",
    answer: "Payouts are processed in rotation order based on when you joined the group (or as reordered by the group admin). When it's your turn, the group admin processes the payout and the full pooled amount is instantly credited to your My Ajo wallet, ready to withdraw to your bank account.",
  },
  {
    question: "How do I withdraw money from my wallet?",
    answer: "Go to Wallet → Withdraw, select your bank, enter your account number to verify your name, enter the amount, and confirm with your 4-digit transaction PIN. Funds are transferred directly to your bank account via Paystack.",
  },
  {
    question: "What happens if I miss a contribution?",
    answer: "Missing a contribution lowers your trust score, which is visible to group admins and may affect your ability to join groups in the future. We recommend enabling reminders in Settings to avoid missing any contribution dates.",
  },
  {
    question: "How do I create a savings group?",
    answer: "Go to My Groups → Create Group, set your contribution amount, frequency (weekly/monthly), and maximum number of members. You'll automatically become the admin and get a unique invite code to share with friends.",
  },
  {
    question: "How does the referral program work?",
    answer: "Share your unique referral code with friends. When they sign up using your code, you both instantly earn ₦5,000 in your wallets! Find your referral code under Refer & Earn.",
  },
  {
    question: "What is BVN verification for?",
    answer: "BVN verification confirms your identity and increases your trust score by 10 points, unlocking full account features. Your BVN is encrypted and never shared with third parties.",
  },
];

export default function SupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("faqs");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Chatbot state
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "bot" | "user"; text: string }[]>([
    { sender: "bot", text: "Hi! 👋 I'm the My Ajo support bot. Ask me anything about contributions, withdrawals, payouts, groups, or your account!" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showHandoff, setShowHandoff] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
  }, []);

  const findFaqAnswer = (userQuestion: string) => {
    const lower = userQuestion.toLowerCase();
    let bestMatch: any = null;
    let bestScore = 0;

    faqs.forEach((faq) => {
      const faqWords = faq.question.toLowerCase().split(" ").filter((w) => w.length > 3);
      const userWords = lower.split(" ").filter((w) => w.length > 3);
      let score = 0;
      faqWords.forEach((word) => {
        if (lower.includes(word)) score++;
      });
      userWords.forEach((word) => {
        if (faq.question.toLowerCase().includes(word)) score++;
        if (faq.answer.toLowerCase().includes(word)) score += 0.5;
      });
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    });

    return bestScore >= 1.5 ? bestMatch : null;
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      const match = findFaqAnswer(userMsg);

      if (match) {
        setChatMessages((prev) => [...prev, { sender: "bot", text: match.answer }]);
        setFailedAttempts(0);
      } else {
        const newFailCount = failedAttempts + 1;
        setFailedAttempts(newFailCount);

        if (newFailCount >= 2) {
          setChatMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "I'm sorry, I couldn't find a good answer for that. 😔 Would you like to talk to a real support person instead?",
            },
          ]);
          setShowHandoff(true);
        } else {
          setChatMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Hmm, I couldn't quite find that in our FAQs. Could you try rephrasing your question? Or ask about contributions, withdrawals, payouts, groups, or verification.",
            },
          ]);
        }
      }
    }, 600);
  };

  const handleContactSubmit = async () => {
    if (!contactForm.subject || !contactForm.message) {
      alert("Please fill in both subject and message");
      return;
    }
    setSending(true);
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setContactForm({ subject: "", message: "" });
        setTimeout(() => setSent(false), 4000);
      } else {
        alert(data.error || "Failed to send message");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSending(false);
    }
  };

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
          <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
            {navItems.map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active ? "bg-emerald-500 text-white" : "text-gray-600 hover:bg-gray-50 hover:text-emerald-500"}`}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-100">
            <a href="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors group">
              <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "U"}
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
            <h1 className="text-lg font-bold text-gray-900">Support & Help</h1>
            <p className="text-sm text-gray-500">We&apos;re here to help you</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                <Phone className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-gray-900">Call Us</h3>
              <a href="tel:07001234567" className="text-emerald-500 font-medium text-sm hover:underline">0700 123 4567</a>
              <p className="text-xs text-gray-400 mt-1">Mon-Fri, 8am-6pm</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900">Email Us</h3>
              <a href="mailto:support@myajo.com" className="text-emerald-500 font-medium text-sm hover:underline">support@myajo.com</a>
              <p className="text-xs text-gray-400 mt-1">Response within 24hrs</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-semibold text-gray-900">Live Chat</h3>
              <button onClick={() => setShowChatBot(true)} className="text-emerald-500 font-medium text-sm hover:underline">
                Chat Now
              </button>
              <p className="text-xs text-gray-400 mt-1">Available 24/7</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: "faqs", label: "FAQs" },
              { id: "contact", label: "Contact Us" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* FAQs Tab */}
          {activeTab === "faqs" && (
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <p className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}

          {/* Contact Us Tab */}
          {activeTab === "contact" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Send us a message</h2>
              <p className="text-sm text-gray-500 mb-6">We typically respond within 24 hours</p>

              {sent && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
                  ✅ Message sent! Our team will get back to you shortly.
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input type="text" value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="What's this about?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea value={contactForm.message} rows={5}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 resize-none" />
                </div>
                <button onClick={handleContactSubmit} disabled={sending}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center">
                  {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Send Message"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* AI FAQ Chatbot */}
      {showChatBot && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-emerald-500 px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">My Ajo Support Bot</div>
                <div className="text-xs text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full" /> Online
                </div>
              </div>
              <button onClick={() => setShowChatBot(false)} className="text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "bot" ? "bg-emerald-100" : "bg-gray-200"}`}>
                    {msg.sender === "bot" ? <Bot className="w-4 h-4 text-emerald-600" /> : <UserIcon className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === "user" ? "bg-emerald-500 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {showHandoff && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined" && (window as any).Tawk_API) {
                        (window as any).Tawk_API.showWidget();
                        (window as any).Tawk_API.maximize();
                        setShowChatBot(false);
                      } else {
                        alert("Live chat connecting... please wait a moment and try again.");
                      }
                      setShowHandoff(false);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                    👤 Talk to a Real Person
                  </button>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-3 flex items-center gap-2 flex-shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Type your question..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              />
              <button onClick={handleSendChat}
                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}