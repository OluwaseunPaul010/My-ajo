"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Users, Shield, Zap, TrendingUp, Bell, MessageCircle,
  ChevronRight, Star, CheckCircle, ArrowRight, Menu, X
} from "lucide-react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">My <span className="text-emerald-500">Ajo</span></span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-500 transition-colors text-sm font-medium">Features</a>
              <a href="#how" className="text-gray-600 hover:text-emerald-500 transition-colors text-sm font-medium">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-emerald-500 transition-colors text-sm font-medium">Testimonials</a>
              <a href="#faq" className="text-gray-600 hover:text-emerald-500 transition-colors text-sm font-medium">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a href="/auth/login" className="text-gray-700 hover:text-emerald-500 text-sm font-medium transition-colors">Login</a>
              <a href="/auth/register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Get Started
              </a>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4"
          >
            <a href="#features" className="text-gray-600 text-sm font-medium">Features</a>
            <a href="#how" className="text-gray-600 text-sm font-medium">How It Works</a>
            <a href="#testimonials" className="text-gray-600 text-sm font-medium">Testimonials</a>
            <a href="#faq" className="text-gray-600 text-sm font-medium">FAQ</a>
            <a href="/auth/login" className="text-gray-700 text-sm font-medium">Login</a>
            <a href="/auth/register" className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center">
              Get Started
            </a>
          </motion.div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" /> Nigeria&apos;s #1 Digital Savings Circle
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6"
            >
              Save Together,{" "}
              <span className="text-emerald-500">Grow</span>{" "}
              Together
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Join trusted ajo savings circles with friends, family and colleagues. 
              Contribute weekly or monthly and receive secure payouts. 
              The modern way to do ajo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <a href="/auth/register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                Start Saving Today <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#how" className="border-2 border-gray-200 hover:border-emerald-500 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
                How It Works <ChevronRight className="w-5 h-5" />
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { value: "₦580M+", label: "Total Paid Out" },
                { value: "48,000+", label: "Happy Members" },
                { value: "99.9%", label: "Success Rate" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-500">{stat.value}</div>
                  <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Save Smart</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Built for Nigerians, trusted by thousands. My Ajo brings the power of community savings to your fingertips.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Ajo Groups", desc: "Create or join savings circles with people you trust. Set contribution amounts and payout schedules.", color: "emerald" },
              { icon: Shield, title: "Secure & Trusted", desc: "Bank-level security with two-factor authentication. Your money is always safe with us.", color: "blue" },
              { icon: Zap, title: "Instant Payouts", desc: "Receive your payout directly to your wallet instantly when it's your turn.", color: "amber" },
              { icon: Bell, title: "Smart Reminders", desc: "Never miss a contribution with intelligent reminders and countdown timers.", color: "purple" },
              { icon: MessageCircle, title: "Group Chat", desc: "Communicate with your group members in real-time. Share updates and stay connected.", color: "pink" },
              { icon: TrendingUp, title: "Savings Analytics", desc: "Track your savings progress with beautiful charts and insights powered by AI.", color: "emerald" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How My Ajo Works</h2>
            <p className="text-gray-600 text-lg">Simple, transparent and trusted</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up in minutes with your phone number and BVN verification." },
              { step: "02", title: "Join or Create Group", desc: "Create your own ajo group or join an existing one with an invite code." },
              { step: "03", title: "Contribute Regularly", desc: "Make weekly or monthly contributions directly from your wallet." },
              { step: "04", title: "Receive Payout", desc: "When it's your turn, receive the full pot directly to your wallet." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Thousands</h2>
            <p className="text-gray-600 text-lg">Real stories from real members</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Chioma Okafor", role: "Business Owner, Lagos", text: "My Ajo helped me save ₦500,000 in 6 months with my market women group. The reminders keep everyone on track!", rating: 5 },
              { name: "Tunde Adeyemi", role: "Software Engineer, Abuja", text: "Finally a digital ajo platform I can trust. The security features and transparency is amazing. Highly recommended!", rating: 5 },
              { name: "Amaka Nwosu", role: "Teacher, Port Harcourt", text: "I used my payout to buy a new laptop for my business. My Ajo made it possible. The chat feature keeps us connected.", rating: 5 },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                  <div className="text-gray-400 text-xs">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "What is Ajo?", a: "Ajo (also called Esusu or Thrift) is a traditional Nigerian group savings system where members contribute a fixed amount regularly and each member receives the total pot in rotation." },
              { q: "Is my money safe on My Ajo?", a: "Yes! We use bank-level encryption, two-factor authentication and are licensed by the CBN. Your funds are always protected." },
              { q: "How do I receive my payout?", a: "Payouts are sent directly to your My Ajo wallet instantly when it's your turn. You can then withdraw to your bank account." },
              { q: "Can I create my own group?", a: "Yes! You can create a group, invite members, set contribution amounts and define the payout rotation order." },
              { q: "What happens if someone misses a contribution?", a: "Members receive multiple reminders. If a payment is missed, the admin is notified and the group can decide on next steps based on group rules." },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-emerald-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Saving?</h2>
            <p className="text-emerald-100 text-lg mb-8">Join 48,000+ Nigerians already saving smarter with My Ajo</p>
            <a href="/auth/register" className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-colors inline-flex items-center gap-2">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">My Ajo</span>
              </div>
              <p className="text-sm leading-relaxed">Nigeria&apos;s premier digital savings circle platform. Save together, grow together.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "How It Works", "Pricing", "Security"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Press"] },
              { title: "Support", links: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}><a href="#" className="text-sm hover:text-emerald-400 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 My Ajo. All rights reserved. Licensed by CBN.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}