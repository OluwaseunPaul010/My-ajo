"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users, Wallet, Shield, Bell, Target,
  ArrowRight, CheckCircle, ChevronRight
} from "lucide-react";

const steps = [
  {
    id: 1,
    icon: "👋",
    title: "Welcome to My Ajo!",
    subtitle: "Nigeria's #1 Digital Savings Circle",
    description: "Join thousands of Nigerians saving smarter together. My Ajo brings the trusted Ajo/Esusu tradition into the digital age.",
    color: "from-emerald-500 to-emerald-600",
    features: [
      { icon: Users, text: "Create or join savings groups" },
      { icon: Wallet, text: "Fund wallet with Paystack" },
      { icon: Shield, text: "Bank-level security" },
    ],
  },
  {
    id: 2,
    icon: "💰",
    title: "How Ajo Works",
    subtitle: "Simple, transparent, trusted",
    description: "Everyone contributes a fixed amount regularly. Each member receives the full pot in rotation. Safe, simple and fair!",
    color: "from-blue-500 to-blue-600",
    features: [
      { icon: CheckCircle, text: "Join a group with invite code" },
      { icon: CheckCircle, text: "Contribute weekly or monthly" },
      { icon: CheckCircle, text: "Receive payout when it's your turn" },
    ],
  },
  {
    id: 3,
    icon: "🔐",
    title: "Your Security Matters",
    subtitle: "We keep your money safe",
    description: "Verify your email and BVN to unlock full features, build trust with other members and increase your trust score.",
    color: "from-purple-500 to-purple-600",
    features: [
      { icon: Shield, text: "Email verification for security" },
      { icon: Shield, text: "BVN verification for identity" },
      { icon: Target, text: "Trust score visible to all groups" },
    ],
  },
  {
    id: 4,
    icon: "🎯",
    title: "Set Your Savings Goals",
    subtitle: "Save with purpose",
    description: "Create personal savings goals alongside your Ajo groups. Track progress and withdraw to your wallet when complete.",
    color: "from-amber-500 to-amber-600",
    features: [
      { icon: Target, text: "Create unlimited savings goals" },
      { icon: Wallet, text: "Deduct savings from wallet" },
      { icon: CheckCircle, text: "Withdraw when goal is complete" },
    ],
  },
  {
    id: 5,
    icon: "🚀",
    title: "You're All Set!",
    subtitle: "Start your savings journey",
    description: "Your account is ready. Fund your wallet, join a group and start your savings journey today!",
    color: "from-emerald-500 to-emerald-600",
    features: [
      { icon: Wallet, text: "Fund your wallet to get started" },
      { icon: Users, text: "Create or join a savings group" },
      { icon: Bell, text: "Enable notifications for reminders" },
    ],
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("onboarding_complete", "true");
      window.location.href = "/dashboard";
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_complete", "true");
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "w-8 bg-emerald-500" : i < currentStep ? "w-4 bg-emerald-300" : "w-4 bg-gray-200"}`} />
            ))}
          </div>
          {!isLast && (
            <button onClick={handleSkip} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Skip
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden">

            {/* Header */}
            <div className={`bg-gradient-to-r ${step.color} p-8 text-white text-center relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
              <div className="relative z-10">
                <div className="text-6xl mb-4">{step.icon}</div>
                <h1 className="text-2xl font-bold mb-1">{step.title}</h1>
                <p className="text-white/80 text-sm">{step.subtitle}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-600 text-center mb-6 leading-relaxed">{step.description}</p>

              <div className="space-y-3 mb-8">
                {step.features.map((feature, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {currentStep === 0 && user && (
                <div className="p-4 bg-emerald-50 rounded-xl mb-6 text-center">
                  <p className="text-emerald-700 text-sm font-medium">
                    Welcome, {user.fullName?.split(" ")[0]}! 🎉 Your account is ready.
                  </p>
                </div>
              )}

              <button onClick={handleNext}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-semibold text-base transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                {isLast ? (
                  <>Get Started <ArrowRight className="w-5 h-5" /></>
                ) : (
                  <>Next <ChevronRight className="w-5 h-5" /></>
                )}
              </button>

              {!isLast && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  Step {currentStep + 1} of {steps.length}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="text-gray-500 text-sm font-medium">My Ajo</span>
        </div>
      </div>
    </div>
  );
}