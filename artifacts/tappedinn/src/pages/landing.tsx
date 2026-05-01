import { Link } from "wouter";
import { ArrowRight, Zap, Globe, Users, Wifi, ShoppingBag, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import logoImg from "/tappedinn-logo.png";

const APP_NAME = "Tapped Inn Network";

const features = [
  {
    icon: Wifi,
    title: "NFC-Powered Profiles",
    description: "Tap your card, share your world. One physical card connects to your living digital profile.",
  },
  {
    icon: Globe,
    title: "Your Contact Hub",
    description: "Everything you are, in one place. Phone, email, portfolio, socials — all instantly accessible.",
  },
  {
    icon: Users,
    title: "Social Graph",
    description: "Build real connections at events. See who you've met, follow their journeys.",
  },
  {
    icon: Zap,
    title: "Live Analytics",
    description: "Know who's engaging with your profile, which links get clicked, when taps happen.",
  },
];

const stats = [
  { value: "0.3s", label: "Average tap-to-profile time" },
  { value: "100%", label: "Mobile-first design" },
  { value: "NFC", label: "NTAG213/215 compatible" },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-4 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="Tapped Inn" className="w-9 h-9 object-contain" style={{ filter: "invert(1)" }} />
          <span className="font-display font-semibold text-lg">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.TappedInn.Net"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Order NFC Cards
          </a>
          <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-16 pt-20 md:pt-32 pb-16 text-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/10 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-8">
            <Wifi className="w-3 h-3" />
            NFC-powered digital identity
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-semibold tracking-tight mb-6">
            Your profile,{" "}
            <span className="gradient-text">one tap</span>{" "}
            away
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {APP_NAME} turns a physical NFC card into a living digital identity.
            Share everything — your links, your work, your story — the moment someone taps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity text-base w-full sm:w-auto justify-center"
            >
              Create your profile
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://www.TappedInn.Net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-accent transition-colors text-base w-full sm:w-auto justify-center"
            >
              <ShoppingBag className="w-4 h-4 text-primary" />
              Order NFC Cards
            </a>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-8 md:gap-16 mt-16 pt-12 border-t border-border/50"
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl md:text-3xl font-display font-semibold gradient-text">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight mb-4">
              Built for real-world networking
            </h2>
            <p className="text-muted-foreground text-lg">
              Not another link-in-bio tool. This is your identity layer.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card card-glow group hover:card-glow-hover transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Order NFC Cards banner */}
      <section className="px-6 md:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <a
            href="https://www.TappedInn.Net"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8 rounded-3xl border border-primary/25 bg-primary/5 hover:bg-primary/8 transition-colors group"
          >
            <img src={logoImg} alt="Tapped Inn" className="w-16 h-16 object-contain shrink-0" style={{ filter: "invert(1)" }} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Physical + Digital</p>
              <h3 className="text-xl font-display font-semibold mb-1">Get your Tapped Inn NFC Card</h3>
              <p className="text-sm text-muted-foreground">
                One tap connects anyone to your profile. No app required. Order your card at <span className="text-primary">TappedInn.Net</span>
              </p>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold group-hover:opacity-90 transition-opacity shrink-0">
              Order now
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-16 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center p-12 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight mb-4">
              Ready to make your mark?
            </h2>
            <p className="text-muted-foreground mb-8">
              Create your profile in under a minute. Your NFC card will do the rest.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity text-base"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="px-6 md:px-16 py-8 border-t border-border/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="Tapped Inn" className="w-6 h-6 object-contain" style={{ filter: "invert(1)" }} />
            <span className="font-display font-medium text-sm">{APP_NAME}</span>
          </div>
          <p className="text-sm text-muted-foreground">The NFC-powered digital identity platform.</p>
          <a
            href="https://www.TappedInn.Net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Order NFC Cards
          </a>
        </div>
      </footer>
    </div>
  );
}
