"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User as UserIcon } from "lucide-react";

const faqs = [
  { question: "What is Ajo?", answer: "Ajo is a traditional Nigerian rotating savings system where a group of people contribute a fixed amount regularly and members take turns receiving the full pooled amount. My Ajo digitizes this trusted system with bank-level security." },
  { question: "Is my money safe on My Ajo?", answer: "Yes! All funds are held securely in your personal wallet and processed through Paystack, a licensed PCI-compliant payment processor. We also use JWT, transaction PINs, 2FA and encrypted BVN verification." },
  { question: "How do I receive my payout?", answer: "Payouts are processed in rotation order. When it's your turn, the group admin processes the payout and the full pooled amount is instantly credited to your My Ajo wallet." },
  { question: "How do I withdraw money?", answer: "Go to Wallet → Withdraw, select your bank, enter your account number, confirm with your 4-digit transaction PIN. Funds are transferred directly to your bank via Paystack." },
  { question: "What happens if I miss a contribution?", answer: "Missing a contribution lowers your trust score. We recommend enabling reminders to avoid missing contribution dates." },
  { question: "How do I create a savings group?", answer: "Go to My Groups → Create Group, set your contribution amount and frequency. You'll automatically become the admin and get a unique invite code." },
  { question: "How does the referral program work?", answer: "Share your unique referral code with friends. When they sign up using your code, you both instantly earn ₦5,000 in your wallets!" },
  { question: "What is BVN verification for?", answer: "BVN verification confirms your identity and increases your trust score by 10 points, unlocking full account features." },
];

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "bot" | "user"; text: string }[]>([
    { sender: "bot", text: "Hi! 👋 I'm the My Ajo support bot. Ask me anything about contributions, withdrawals, payouts, or groups!" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showHandoff, setShowHandoff] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const findFaqAnswer = (userQuestion: string) => {
    const lower = userQuestion.toLowerCase();
    let bestMatch: any = null;
    let bestScore = 0;

    faqs.forEach((faq) => {
      const faqWords = faq.question.toLowerCase().split(" ").filter((w) => w.length > 3);
      const userWords = lower.split(" ").filter((w) => w.length > 3);
      let score = 0;
      faqWords.forEach((word) => { if (lower.includes(word)) score++; });
      userWords.forEach((word) => {
        if (faq.question.toLowerCase().includes(word)) score++;
        if (faq.answer.toLowerCase().includes(word)) score += 0.5;
      });
      if (score > bestScore) { bestScore = score; bestMatch = faq; }
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
          setChatMessages((prev) => [...prev, {
            sender: "bot",
            text: "I'm sorry, I couldn't find a good answer for that. 😔 Would you like to talk to a real support person instead?",
          }]);
          setShowHandoff(true);
        } else {
          setChatMessages((prev) => [...prev, {
            sender: "bot",
            text: "Hmm, I couldn't quite find that. Could you rephrase? Try asking about contributions, withdrawals, payouts, groups, or verification.",
          }]);
        }
      }
    }, 600);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasMoved(false);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setHasMoved(true);
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    const maxX = window.innerWidth - 64;
    const maxY = window.innerHeight - 64;
    setPosition({
      x: Math.max(-window.innerWidth + 64, Math.min(0, newX)),
      y: Math.max(-window.innerHeight + 64, Math.min(0, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setHasMoved(false);
    dragStart.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setHasMoved(true);
    const touch = e.touches[0];
    setPosition({
      x: Math.max(-window.innerWidth + 64, Math.min(0, touch.clientX - dragStart.current.x)),
      y: Math.max(-window.innerHeight + 64, Math.min(0, touch.clientY - dragStart.current.y)),
    });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, position]);

  return (
    <>
      {/* Floating Ball */}
      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => { if (!hasMoved) setIsOpen(!isOpen); }}
        style={{
          position: "fixed",
          bottom: `${16 - position.y}px`,
          right: `${16 - position.x}px`,
          cursor: isDragging ? "grabbing" : "grab",
          zIndex: 9999,
          userSelect: "none",
        }}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen ? "bg-gray-700" : "bg-emerald-500"}`}>
          {isOpen
            ? <X className="w-6 h-6 text-white" />
            : <MessageCircle className="w-6 h-6 text-white" />}
          {!isOpen && chatMessages.length > 1 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {chatMessages.filter((m) => m.sender === "bot").length - 1}
            </span>
          )}
        </motion.div>
        {!isOpen && !hasMoved && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-1 right-16 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-xl whitespace-nowrap pointer-events-none">
            Need help? 👋
            <div className="absolute top-1/2 -translate-y-1/2 right-[-6px] w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-gray-900" />
          </motion.div>
        )}
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{ position: "fixed", bottom: "88px", right: "16px", zIndex: 9998 }}
            className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            css={{ height: "460px" }}>

            {/* Header */}
            <div className="bg-emerald-500 px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">My Ajo Support</div>
                <div className="text-xs text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                  Online • Ask me anything
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "bot" ? "bg-emerald-100" : "bg-gray-200"}`}>
                    {msg.sender === "bot"
                      ? <Bot className="w-4 h-4 text-emerald-600" />
                      : <UserIcon className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.sender === "user" ? "bg-emerald-500 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {showHandoff && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined" && (window as any).Tawk_API) {
                        (window as any).Tawk_API.showWidget();
                        (window as any).Tawk_API.maximize();
                        setIsOpen(false);
                      } else {
                        alert("Connecting to live support... please try again in a moment.");
                      }
                      setShowHandoff(false);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2">
                    👤 Talk to a Real Person
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-3 flex items-center gap-2 flex-shrink-0 bg-white">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Ask a question..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
              <button onClick={handleSendChat}
                disabled={!chatInput.trim()}
                className="w-9 h-9 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}