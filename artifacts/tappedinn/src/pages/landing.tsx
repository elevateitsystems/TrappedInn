import { Link } from "wouter";
import { ArrowRight, Wifi, ShoppingBag, ExternalLink, BarChart2, Users, Globe, MousePointer2, Share2, Zap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import logoImg from "/tappedinn-logo.png";

const APP_NAME = "Tapped Inn Network";

const GREEN = "#00ff41";
const GREEN_DIM = "#00cc33";
const GREEN_DARK = "#0a2e0a";
const GREEN_BG = "#050f05";
const GREEN_CARD = "#0d1a0d";
const GREEN_BORDER = "#1a4a1a";
const GREEN_GLOW = "rgba(0,255,65,0.08)";

function PhoneMockup() {
  return (
    <div className="relative flex items-center justify-center select-none">
      <div
        className="relative w-[220px] h-[420px] rounded-[36px] border-2 overflow-hidden shadow-2xl"
        style={{ borderColor: GREEN_BORDER, background: "#080808" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-xl" style={{ background: "#111" }} />
        <div className="flex flex-col items-center pt-10 pb-6 px-4 h-full">
          <div className="w-16 h-16 rounded-full mb-2 flex items-center justify-center text-2xl font-bold border-2" style={{ borderColor: GREEN, background: GREEN_DARK, color: GREEN }}>
            JD
          </div>
          <p className="text-white font-semibold text-sm mb-0.5">@johndoe</p>
          <p className="text-xs mb-4" style={{ color: "#6b7280" }}>Digital Creator • NYC</p>
          <div className="w-full space-y-2.5 mt-auto">
            {["🎵 My Music", "📸 Portfolio", "🔗 Book a Call", "🛒 My Store"].map((lbl) => (
              <div
                key={lbl}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-center"
                style={{ background: GREEN_DARK, color: GREEN, border: `1px solid ${GREEN_BORDER}` }}
              >
                {lbl}
              </div>
            ))}
          </div>
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-8 top-14 px-3 py-2 rounded-xl text-xs font-bold shadow-lg"
        style={{ background: GREEN, color: "#000", border: `1px solid ${GREEN_DIM}` }}
      >
        ⚡ 1 Tap Away
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -left-10 bottom-24 px-3 py-2 rounded-xl text-xs font-bold shadow-lg"
        style={{ background: "#111", color: GREEN, border: `1px solid ${GREEN_BORDER}` }}
      >
        📲 247 taps today
      </motion.div>
    </div>
  );
}

function ShareGrid() {
  const items = [
    { label: "tappedinn.me/alex", emoji: "🔗", bg: GREEN_DARK },
    { label: "Instagram", emoji: "📸", bg: "#0d0d1a" },
    { label: "Portfolio", emoji: "🌐", bg: "#1a0d0d" },
    { label: "LinkedIn", emoji: "💼", bg: "#0d1a1a" },
    { label: "YouTube", emoji: "🎬", bg: "#1a1a0d" },
    { label: "Booking", emoji: "📅", bg: "#1a0d1a" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto md:mx-0">
      {items.map(({ label, emoji, bg }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-white"
          style={{ background: bg, border: `1px solid ${GREEN_BORDER}` }}
        >
          <span className="text-base">{emoji}</span>
          <span className="text-xs" style={{ color: "#9ca3af" }}>{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function AnalyticsWidget() {
  const cards = [
    { value: "2,847", label: "Profile Views", color: GREEN },
    { value: "412", label: "Link Clicks", color: "#60a5fa" },
    { value: "89", label: "NFC Taps", color: "#f59e0b" },
    { value: "37", label: "Connections", color: "#a78bfa" },
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
          className="p-4 rounded-2xl"
          style={{ background: GREEN_CARD, border: `1px solid ${GREEN_BORDER}` }}
        >
          <p className="text-2xl font-display font-bold mb-0.5" style={{ color }}>{value}</p>
          <p className="text-xs" style={{ color: "#6b7280" }}>{label}</p>
        </motion.div>
      ))}
    </div>
  );
}

const featureCards = [
  {
    icon: Wifi,
    title: "NFC Tap-to-Connect",
    desc: "One physical tap with your Tapped Inn card opens your full digital profile. No app needed, no friction.",
  },
  {
    icon: Share2,
    title: "Share Everything",
    desc: "Links, socials, portfolio, booking pages — centralized in one sleek profile you can update anytime.",
  },
  {
    icon: BarChart2,
    title: "Live Analytics",
    desc: "See exactly who's tapping, which links they click, and when engagement peaks.",
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
    <div className="min-h-dvh overflow-x-hidden" style={{ background: "#000", color: "#fff", fontFamily: "inherit" }}>

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4"
        style={{ background: "rgba(0,0,0,0.9)", borderBottom: `1px solid ${GREEN_BORDER}`, backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="Tapped Inn" className="w-8 h-8 object-contain" style={{ filter: "invert(1) sepia(1) saturate(10) hue-rotate(90deg)" }} />
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: GREEN }}>{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.TappedInn.net"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
            style={{ color: GREEN }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Order Card
          </a>
          <Link href="/sign-in" className="text-sm font-medium transition-colors" style={{ color: "#9ca3af" }}>
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: GREEN, color: "#000" }}
          >
            Get Tapped Inn
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-16 pt-20 md:pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 30% 40%, ${GREEN_GLOW}, transparent)`,
        }} />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{ background: GREEN_DARK, color: GREEN, border: `1px solid ${GREEN_BORDER}` }}
            >
              <Wifi className="w-3 h-3" />
              NFC-Powered Digital Identity
            </div>
            <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
              One tap.<br />
              <span style={{ color: GREEN }}>Your entire</span><br />
              world.
            </h1>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "#9ca3af" }}>
              Tapped Inn turns a single NFC card tap into your complete digital identity.
              Share your links, contacts, and story the moment someone gets close — no app required.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div
                className="flex items-center rounded-xl overflow-hidden flex-1"
                style={{ border: `1.5px solid ${GREEN_BORDER}`, background: GREEN_CARD }}
              >
                <span className="pl-4 text-sm font-medium" style={{ color: "#6b7280" }}>tappedinn.me/</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  className="flex-1 bg-transparent py-3.5 pr-4 text-sm font-medium outline-none placeholder-gray-600 text-white"
                />
              </div>
              <Link
                href={username ? `/sign-up?username=${encodeURIComponent(username)}` : "/sign-up"}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-85 shrink-0"
                style={{ background: GREEN, color: "#000" }}
              >
                Get Tapped Inn
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center gap-6">
              {[["⚡", "Setup in 60 seconds"], ["🆓", "Free to start"], ["💳", "NFC card optional"]].map(([icon, txt]) => (
                <div key={txt} className="flex items-center gap-1.5 text-xs" style={{ color: "#6b7280" }}>
                  <span>{icon}</span>
                  <span>{txt}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex justify-center"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </section>

      {/* Divider / social proof bar */}
      <div
        className="px-6 md:px-16 py-8"
        style={{ background: GREEN_DARK, borderTop: `1px solid ${GREEN_BORDER}`, borderBottom: `1px solid ${GREEN_BORDER}` }}
      >
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            ["🔗", "All your links, one place"],
            ["📲", "NFC tap-to-share"],
            ["📊", "Real-time analytics"],
            ["🌐", "Your profile, anywhere"],
          ].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-2 text-sm font-semibold" style={{ color: GREEN }}>
              <span className="text-lg">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Feature Block 1: Build your profile */}
      <section className="px-6 md:px-16 py-24" style={{ background: GREEN_BG }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1 flex justify-center"
          >
            <div
              className="relative w-full max-w-sm p-6 rounded-3xl"
              style={{ background: GREEN_CARD, border: `1px solid ${GREEN_BORDER}` }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GREEN }}>Your Tapped Inn Profile</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold" style={{ background: GREEN_DARK, color: GREEN, border: `1px solid ${GREEN_BORDER}` }}>
                  TI
                </div>
                <div>
                  <p className="font-bold text-sm text-white">@yourname</p>
                  <p className="text-xs" style={{ color: "#6b7280" }}>🏙 NYC · Creator</p>
                </div>
                <div className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: GREEN_DARK, color: GREEN }}>
                  ✔ Verified
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "🎵 My Latest Music", clr: GREEN_DARK },
                  { label: "📸 Photography Portfolio", clr: "#0d0d1a" },
                  { label: "📅 Book a Meeting", clr: "#1a0a0a" },
                  { label: "🛒 My Online Store", clr: "#1a1a0a" },
                ].map(({ label, clr }) => (
                  <div
                    key={label}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white flex items-center justify-between"
                    style={{ background: clr, border: `1px solid ${GREEN_BORDER}` }}
                  >
                    {label}
                    <ExternalLink className="w-3 h-3" style={{ color: GREEN }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2"
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GREEN }}>Build Your Identity</p>
            <h2 className="font-display font-black text-4xl md:text-5xl leading-tight tracking-tight mb-6 text-white">
              Create your Tapped Inn profile in minutes
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "#9ca3af" }}>
              Connect all your content across social media, websites, stores, and more — in one living profile.
              Customize every detail to match your brand and get more clicks.
            </p>
            <div className="space-y-3 mb-8">
              {["Pick your username", "Add all your links & contact info", "Customize your look & theme", "Tap to share with anyone, anywhere"].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: GREEN, color: "#000" }}>
                    {i + 1}
                  </div>
                  <span className="text-sm text-white">{step}</span>
                </div>
              ))}
            </div>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-85"
              style={{ background: GREEN, color: "#000" }}
            >
              Get Tapped Inn for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Block 2: Share everywhere */}
      <section className="px-6 md:px-16 py-24" style={{ background: "#000" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GREEN }}>Share Anywhere</p>
            <h2 className="font-display font-black text-4xl md:text-5xl leading-tight tracking-tight mb-6 text-white">
              Share your profile everywhere you go
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "#9ca3af" }}>
              Add your unique Tapped Inn link to every platform where your audience lives.
              Use your NFC card to drive in-person traffic back to your digital world.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {["📱 TikTok", "📸 Instagram", "🐦 Twitter/X", "💼 LinkedIn", "📧 Email signature", "🎤 At events"].map((p) => (
                <span
                  key={p}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: GREEN_DARK, color: GREEN, border: `1px solid ${GREEN_BORDER}` }}
                >
                  {p}
                </span>
              ))}
            </div>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-85"
              style={{ background: GREEN, color: "#000" }}
            >
              Get Tapped Inn for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <ShareGrid />
          </motion.div>
        </div>
      </section>

      {/* Feature Block 3: Analytics */}
      <section className="px-6 md:px-16 py-24" style={{ background: GREEN_BG }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <AnalyticsWidget />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GREEN }}>Analytics</p>
            <h2 className="font-display font-black text-4xl md:text-5xl leading-tight tracking-tight mb-6 text-white">
              Know who's engaging with you
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "#9ca3af" }}>
              Track your engagement in real time. See which links get clicked, when NFC taps happen, and who's connecting with you.
              Make informed updates on the fly to keep your audience coming back.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-85"
              style={{ background: GREEN, color: "#000" }}
            >
              Get Tapped Inn for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 4-up feature grid */}
      <section className="px-6 md:px-16 py-24" style={{ background: "#000" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-4 text-white">
              Everything you need to<br />
              <span style={{ color: GREEN }}>Get Tapped Inn</span>
            </h2>
            <p className="text-lg" style={{ color: "#6b7280" }}>
              One platform. Your entire digital presence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featureCards.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl group cursor-default transition-all"
                style={{
                  background: GREEN_CARD,
                  border: `1px solid ${GREEN_BORDER}`,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = GREEN; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = GREEN_BORDER; }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors"
                  style={{ background: GREEN_DARK }}
                >
                  <Icon className="w-5 h-5" style={{ color: GREEN }} />
                </div>
                <h3 className="font-display font-bold text-base mb-2 text-white">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NFC card order banner */}
      <section className="px-6 md:px-16 py-8" style={{ background: GREEN_BG }}>
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
            className="flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8 rounded-3xl group transition-opacity hover:opacity-90"
            style={{ background: GREEN_DARK, border: `1.5px solid ${GREEN}` }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: GREEN, color: "#000" }}
            >
              <Wifi className="w-7 h-7" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: GREEN }}>Physical + Digital</p>
              <h3 className="text-xl font-display font-black mb-1 text-white">Get your Tapped Inn NFC Card</h3>
              <p className="text-sm" style={{ color: "#9ca3af" }}>
                One tap connects anyone to your profile. No app required. Order at <span style={{ color: GREEN }}>TappedInn.net</span>
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shrink-0 transition-opacity group-hover:opacity-85"
              style={{ background: GREEN, color: "#000" }}
            >
              Order now
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-16 py-28 relative overflow-hidden" style={{ background: "#000" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${GREEN_GLOW}, transparent)`,
        }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8"
            style={{ background: GREEN_DARK, color: GREEN, border: `1px solid ${GREEN_BORDER}` }}
          >
            <CheckCircle className="w-4 h-4" /> Free to start · No credit card needed
          </div>
          <h2 className="font-display font-black text-5xl md:text-7xl tracking-tight mb-6 text-white">
            Ready to<br />
            <span style={{ color: GREEN }}>Get Tapped Inn?</span>
          </h2>
          <p className="text-xl mb-10" style={{ color: "#9ca3af" }}>
            Create your profile in under a minute. Your NFC card does the rest.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-lg transition-opacity hover:opacity-85 w-full sm:w-auto justify-center"
              style={{ background: GREEN, color: "#000" }}
            >
              Get Tapped Inn — It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-colors w-full sm:w-auto justify-center"
              style={{ border: `1.5px solid ${GREEN_BORDER}`, color: "#9ca3af", background: "transparent" }}
            >
              Already have an account?
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 md:px-16 py-8"
        style={{ background: GREEN_BG, borderTop: `1px solid ${GREEN_BORDER}` }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="Tapped Inn" className="w-6 h-6 object-contain" style={{ filter: "invert(1) sepia(1) saturate(10) hue-rotate(90deg)" }} />
            <span className="font-display font-bold text-sm" style={{ color: GREEN }}>{APP_NAME}</span>
          </div>
          <p className="text-sm" style={{ color: "#6b7280" }}>The NFC-powered digital identity platform.</p>
          <a
            href="https://www.TappedInn.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold hover:underline flex items-center gap-1 transition-colors"
            style={{ color: GREEN }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Order Your Tapped Inn Card
          </a>
        </div>
      </footer>
    </div>
  );
}
