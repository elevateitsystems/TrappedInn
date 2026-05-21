import { Link } from "wouter";
import { ArrowRight, Wifi, ShoppingBag, ExternalLink, BarChart2, Users, Share2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import logoImg from "/tappedinn-logo.png";

const APP_NAME = "Tapped Inn Network";

const GOLD = "#C9A84C";
const GOLD_DIM = "#a88a3a";
const GOLD_BG = "rgba(201,168,76,0.08)";
const GOLD_BORDER = "rgba(201,168,76,0.25)";
const DARK = "#0a0a0a";
const CARD = "#111111";
const CARD2 = "#161616";
const BORDER = "#222222";

function PhoneMockup() {
  return (
    <div className="relative flex items-center justify-center select-none">
      <div
        className="relative w-[210px] h-[400px] rounded-[36px] border overflow-hidden shadow-2xl"
        style={{ borderColor: BORDER, background: "#080808", boxShadow: `0 0 60px ${GOLD_BG}` }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-xl" style={{ background: "#111" }} />
        <div
          className="w-full h-24 absolute top-0 left-0"
          style={{ background: `linear-gradient(135deg, #1a1206 0%, #2a1f0a 50%, #111 100%)` }}
        />
        <div className="flex flex-col items-center pt-12 pb-5 px-4 h-full relative">
          <div
            className="w-14 h-14 rounded-full mb-2 flex items-center justify-center text-lg font-bold border-2"
            style={{ borderColor: GOLD, background: "#1a1206", color: GOLD }}
          >
            JD
          </div>
          <p className="text-white font-semibold text-xs mb-0.5">@johndoe</p>
          <p className="text-xs mb-4" style={{ color: "#666" }}>Digital Creator · NYC</p>
          <div className="w-full space-y-2 mt-auto">
            {["🎵 My Music", "📸 Portfolio", "🔗 Book a Call", "🛒 My Store"].map((lbl) => (
              <div
                key={lbl}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-center"
                style={{ background: CARD2, color: "#e5e5e5", border: `1px solid ${BORDER}` }}
              >
                {lbl}
              </div>
            ))}
          </div>
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-10 top-10 px-3 py-2 rounded-xl text-xs font-bold shadow-xl"
        style={{ background: GOLD, color: "#000" }}
      >
        ⚡ 1 Tap Away
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="absolute -left-12 bottom-20 px-3 py-2 rounded-xl text-xs font-bold shadow-xl"
        style={{ background: CARD2, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}
      >
        📲 247 taps today
      </motion.div>
    </div>
  );
}

function ShareGrid() {
  const items = [
    { label: "Instagram", emoji: "📸" },
    { label: "TikTok", emoji: "🎵" },
    { label: "Portfolio", emoji: "🌐" },
    { label: "LinkedIn", emoji: "💼" },
    { label: "YouTube", emoji: "🎬" },
    { label: "Booking", emoji: "📅" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto md:mx-0">
      {items.map(({ label, emoji }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07 }}
          className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}
        >
          <span className="text-base">{emoji}</span>
          <span className="text-sm font-medium text-white">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function AnalyticsWidget() {
  const cards = [
    { value: "2,847", label: "Profile Views", color: GOLD },
    { value: "412", label: "Link Clicks", color: "#60a5fa" },
    { value: "89", label: "NFC Taps", color: "#a78bfa" },
    { value: "37", label: "Connections", color: "#34d399" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto md:mx-0">
      {cards.map(({ value, label, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="p-5 rounded-2xl"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}
        >
          <p className="text-2xl font-display font-bold mb-0.5" style={{ color }}>{value}</p>
          <p className="text-xs" style={{ color: "#666" }}>{label}</p>
        </motion.div>
      ))}
    </div>
  );
}

const featureCards = [
  {
    icon: Wifi,
    title: "NFC Tap-to-Connect",
    desc: "One tap with your Tapped Inn card opens your full digital profile instantly. No app, no friction.",
  },
  {
    icon: Share2,
    title: "Share Everything",
    desc: "Links, socials, portfolio, booking — all in one sleek profile you can update anytime.",
  },
  {
    icon: BarChart2,
    title: "Live Analytics",
    desc: "See exactly who's tapping, which links get clicked, and when your engagement peaks.",
  },
  {
    icon: Users,
    title: "Real Connections",
    desc: "Build your social graph. Track who you've met at events and follow their journey.",
  },
];

export default function LandingPage() {
  const [username, setUsername] = useState("");

  return (
    <div className="min-h-dvh overflow-x-hidden" style={{ background: DARK, color: "#fff" }}>

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4"
        style={{ background: "rgba(10,10,10,0.92)", borderBottom: `1px solid ${BORDER}`, backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="Tapped Inn" className="w-8 h-8 object-contain" style={{ filter: "invert(1)" }} />
          <span className="font-display font-bold text-base tracking-tight text-white">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://www.TappedInn.net"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white"
            style={{ color: "#888" }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Order Card
          </a>
          <Link href="/sign-in" className="text-sm font-medium transition-colors hover:text-white" style={{ color: "#888" }}>
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-85"
            style={{ background: GOLD, color: "#000" }}
          >
            Get Tapped Inn
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-16 pt-24 md:pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 55% 45% at 25% 50%, ${GOLD_BG}, transparent)`,
        }} />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8 uppercase tracking-widest"
              style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}
            >
              <Wifi className="w-3 h-3" />
              NFC-Powered Digital Identity
            </div>

            <h1 className="font-display font-black leading-[1.0] tracking-tight mb-6" style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
              TAP.{" "}
              <span style={{ color: GOLD }}>CONNECT.</span>
              <br />
              GET TAPPED INN.
            </h1>

            <p className="text-lg leading-relaxed mb-8" style={{ color: "#999" }}>
              Professional networking tools that connect instantly.
              No apps, no hassle — just real connections that matter.
            </p>

            <div
              className="flex items-center rounded-xl overflow-hidden mb-4"
              style={{ border: `1.5px solid ${BORDER}`, background: CARD }}
            >
              <span className="pl-4 text-sm" style={{ color: "#555" }}>tappedinn.me/</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                className="flex-1 bg-transparent py-4 pr-4 text-sm font-medium outline-none text-white"
                style={{ caretColor: GOLD }}
              />
              <Link
                href={username ? `/sign-up?username=${encodeURIComponent(username)}` : "/sign-up"}
                className="m-1.5 inline-flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm transition-opacity hover:opacity-85 shrink-0"
                style={{ background: GOLD, color: "#000" }}
              >
                Claim yours
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center gap-6">
              {[["⚡", "60-second setup"], ["🆓", "Free to start"], ["💳", "NFC card available"]].map(([icon, txt]) => (
                <div key={txt as string} className="flex items-center gap-1.5 text-xs" style={{ color: "#555" }}>
                  <span>{icon}</span>
                  <span>{txt}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="flex justify-center"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </section>

      {/* Value bar */}
      <div style={{ background: CARD, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-5xl mx-auto px-6 md:px-16 py-5 flex flex-wrap justify-center gap-10">
          {[["🔗", "All your links, one place"], ["📲", "NFC tap-to-share"], ["📊", "Real-time analytics"], ["🌐", "Your profile, anywhere"]].map(([icon, label]) => (
            <div key={label as string} className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#aaa" }}>
              <span className="text-lg">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Feature: Build your profile */}
      <section className="px-6 md:px-16 py-24" style={{ background: "#0d0d0d" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1 flex justify-center"
          >
            <div
              className="w-full max-w-sm p-6 rounded-3xl"
              style={{ background: CARD, border: `1px solid ${BORDER}` }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GOLD }}>Your Profile</p>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold" style={{ background: "#1a1206", color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>TI</div>
                <div>
                  <p className="font-bold text-sm text-white">@yourname</p>
                  <p className="text-xs" style={{ color: "#666" }}>🏙 NYC · Creator</p>
                </div>
                <div className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>✔ Verified</div>
              </div>
              <div className="space-y-2.5">
                {["🎵 My Latest Music", "📸 Photography Portfolio", "📅 Book a Meeting", "🛒 My Online Store"].map((label) => (
                  <div key={label} className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white flex items-center justify-between" style={{ background: CARD2, border: `1px solid ${BORDER}` }}>
                    {label}
                    <ExternalLink className="w-3 h-3" style={{ color: GOLD }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GOLD }}>Build Your Identity</p>
            <h2 className="font-display font-black text-4xl md:text-5xl leading-tight tracking-tight mb-5 text-white">
              Create and customize your Tapped Inn profile in minutes
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "#888" }}>
              Connect all your links, socials, stores, and contact info in one living profile.
              Customize your look and get more clicks — from anywhere, on any device.
            </p>
            <div className="space-y-3 mb-8">
              {["Pick your username", "Add your links & contact info", "Customize your theme & header image", "Tap to share with anyone"].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: GOLD, color: "#000" }}>{i + 1}</div>
                  <span className="text-sm text-white">{step}</span>
                </div>
              ))}
            </div>
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-85" style={{ background: GOLD, color: "#000" }}>
              Get Tapped Inn for free <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature: Share everywhere */}
      <section className="px-6 md:px-16 py-24" style={{ background: DARK }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GOLD }}>Share Anywhere</p>
            <h2 className="font-display font-black text-4xl md:text-5xl leading-tight tracking-tight mb-5 text-white">
              Share your Tapped Inn profile everywhere you go
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "#888" }}>
              Add your unique Tapped Inn link to every platform where your audience lives.
              Use your NFC card to drive in-person connections back to your digital world.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {["📱 TikTok", "📸 Instagram", "🐦 Twitter/X", "💼 LinkedIn", "📧 Email sig", "🎤 Events"].map((p) => (
                <span key={p} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: CARD, color: "#aaa", border: `1px solid ${BORDER}` }}>{p}</span>
              ))}
            </div>
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-85" style={{ background: GOLD, color: "#000" }}>
              Get Tapped Inn for free <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <ShareGrid />
          </motion.div>
        </div>
      </section>

      {/* Feature: Analytics */}
      <section className="px-6 md:px-16 py-24" style={{ background: "#0d0d0d" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <AnalyticsWidget />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GOLD }}>Analytics</p>
            <h2 className="font-display font-black text-4xl md:text-5xl leading-tight tracking-tight mb-5 text-white">
              Know who's engaging with you
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "#888" }}>
              Track your engagement in real time. See which links get clicked, when NFC taps happen,
              and who's connecting with you — so you can keep your audience coming back.
            </p>
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-85" style={{ background: GOLD, color: "#000" }}>
              Get Tapped Inn for free <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 4-up feature grid */}
      <section className="px-6 md:px-16 py-24" style={{ background: DARK }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-4 text-white">
              Everything you need to{" "}
              <span style={{ color: GOLD }}>Get Tapped Inn</span>
            </h2>
            <p className="text-lg" style={{ color: "#666" }}>One platform. Your entire digital presence.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featureCards.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl transition-all cursor-default"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = GOLD_BORDER; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = BORDER; }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_BG }}>
                  <Icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <h3 className="font-display font-bold text-base mb-2 text-white">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#666" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NFC card banner */}
      <section className="px-6 md:px-16 py-8" style={{ background: "#0d0d0d" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <a
            href="https://www.TappedInn.net"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center gap-6 p-7 rounded-3xl group transition-colors"
            style={{ background: CARD, border: `1px solid ${GOLD_BORDER}` }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = GOLD; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = GOLD_BORDER; }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: GOLD, color: "#000" }}>
              <Wifi className="w-7 h-7" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: GOLD }}>Physical + Digital</p>
              <h3 className="text-xl font-display font-black mb-1 text-white">Get your Tapped Inn NFC Card</h3>
              <p className="text-sm" style={{ color: "#777" }}>One tap connects anyone to your profile. No app required. Order at <span style={{ color: GOLD }}>TappedInn.net</span></p>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shrink-0 transition-opacity group-hover:opacity-85" style={{ background: GOLD, color: "#000" }}>
              Order now <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-16 py-28 relative overflow-hidden" style={{ background: DARK }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 50%, ${GOLD_BG}, transparent)`,
        }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8" style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
            <CheckCircle className="w-4 h-4" /> Free to start · No credit card needed
          </div>
          <h2 className="font-display font-black tracking-tight mb-6 text-white" style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)", lineHeight: 1.0 }}>
            READY TO<br />
            <span style={{ color: GOLD }}>GET TAPPED INN?</span>
          </h2>
          <p className="text-xl mb-10" style={{ color: "#888" }}>
            Create your profile in under a minute. Your NFC card does the rest.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-lg transition-opacity hover:opacity-85 w-full sm:w-auto justify-center"
              style={{ background: GOLD, color: "#000" }}
            >
              Get Tapped Inn — It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center px-8 py-4 rounded-xl font-bold text-base transition-colors w-full sm:w-auto justify-center hover:text-white"
              style={{ border: `1px solid ${BORDER}`, color: "#777" }}
            >
              Already have an account?
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 py-8" style={{ background: "#0a0a0a", borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="Tapped Inn" className="w-6 h-6 object-contain" style={{ filter: "invert(1)" }} />
            <span className="font-display font-bold text-sm text-white">{APP_NAME}</span>
          </div>
          <p className="text-sm" style={{ color: "#555" }}>The NFC-powered digital identity platform.</p>
          <a
            href="https://www.TappedInn.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold hover:underline flex items-center gap-1.5 transition-colors"
            style={{ color: GOLD }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Order Your Tapped Inn Card
          </a>
        </div>
      </footer>
    </div>
  );
}
