"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useGetPublicProfile, useTrackEvent } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Wifi, ExternalLink, Phone, Mail, Globe, MessageSquare, Download, QrCode, Loader2, MapPin } from "lucide-react";
import { VerifiedBadge, VerificationLevel } from "@/components/verified-badge";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { downloadVCard } from "@/lib/vcard";
import { QrModal } from "@/components/qr-modal";

const APP_NAME = "Tapped Inn Network";

export default function PublicProfilePage() {
  const params = useParams() as { username?: string };
  const username = params?.username ?? "";

  const { data: profile, isLoading, isError } = useGetPublicProfile(username, {
    query: { enabled: !!username } as any,
  });
  const trackEvent = useTrackEvent();

  const [showQr, setShowQr] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadDone, setLeadDone] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      trackEvent.mutate({ data: { profileId: profile.id, eventType: "view" } });
    }
  }, [profile?.id]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setLeadSubmitting(true);
    try {
      await fetch(`/api/analytics/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.id, name: leadName, email: leadEmail }),
      });
      setLeadDone(true);
    } finally {
      setLeadSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-6">
          <Wifi className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-display font-semibold mb-2">Profile not found</h1>
        <p className="text-muted-foreground mb-6">This username doesn't exist on {APP_NAME}.</p>
        <Link href="/" className="text-primary hover:underline text-sm">Go to {APP_NAME}</Link>
      </div>
    );
  }

  const p = profile as any;
  const ts = p.themeSettings ?? {};
  const cs = p.contactSettings ?? { showPhone: true, showEmail: true, showWebsite: true, showSms: false };
  const bgColor = ts.backgroundColor || undefined;
  const textColor = ts.textColor || undefined;
  const buttonStyle = ts.buttonStyle ?? "rounded";
  const layout = ts.layout ?? "classic";
  const verificationLevel = (p.verificationLevel ?? (p.verified ? "blue" : "none")) as VerificationLevel;
  const leadCaptureEnabled = !!p.leadCaptureEnabled;

  const buttonRadius = buttonStyle === "rounded" ? "rounded-full" : buttonStyle === "square" ? "rounded-none" : "rounded-xl";
  const buttonBg = buttonStyle === "outline" ? "bg-transparent border-2" : "bg-card border border-border";

  const profileUrl = `${window.location.origin}/p/${username}`;

  const showLocation = cs.showLocation !== false; // default true
  const mapsHref = p.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.location)}`
    : "";

  const contactButtons = [
    p.phone && cs.showPhone && { label: "Call", href: `tel:${p.phone}`, icon: Phone },
    p.smsNumber && cs.showSms && { label: "Text", href: `sms:${p.smsNumber}`, icon: MessageSquare },
    p.email && cs.showEmail && { label: "Email", href: `mailto:${p.email}`, icon: Mail },
    p.website && cs.showWebsite && { label: "Website", href: p.website, icon: Globe, external: true },
    p.location && showLocation && { label: "Directions", href: mapsHref, icon: MapPin, external: true },
  ].filter(Boolean) as { label: string; href: string; icon: React.ElementType; external?: boolean }[];

  return (
    <div
      className="min-h-dvh flex items-start justify-center px-4 py-12 md:py-16"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {showQr && (
        <QrModal url={profileUrl} title={profile?.displayName} onClose={() => setShowQr(false)} />
      )}

      <div className="w-full max-w-sm md:max-w-xl mx-auto">
        {/* Header image + Avatar + identity */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col ${layout === "hero" ? "mb-6" : "mb-7"}`}
        >
          {/* Header banner */}
          {p.headerImageUrl ? (
            <div className="relative mb-10 md:mb-16">
              {/* Banner image — overflow-hidden only on this inner div */}
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src={p.headerImageUrl}
                  alt="Profile header"
                  width={768}
                  height={288}
                  priority
                  sizes="(min-width: 768px) 576px, 100vw"
                  className="w-full h-32 md:h-56 object-cover"
                />
              </div>
              {/* Avatar sits OUTSIDE overflow-hidden so it isn't clipped */}
              <div className="absolute -bottom-8 md:-bottom-14 left-4 md:left-6" style={{ zIndex: 10 }}>
                {profile?.avatarUrl ? (
                  <Image
                    src={profile?.avatarUrl}
                    alt={profile?.displayName}
                    width={112}
                    height={112}
                    priority
                    sizes="(min-width: 768px) 112px, 64px"
                    className="w-16 h-16 md:w-28 md:h-28 rounded-full object-cover"
                    style={{ border: "4px solid hsl(var(--background))" }}
                  />
                ) : (
                  <div className="w-16 h-16 md:w-28 md:h-28 rounded-full gradient-primary flex items-center justify-center text-white font-display font-semibold text-2xl md:text-4xl" style={{ border: "4px solid hsl(var(--background))" }}>
                    {profile?.displayName?.[0]?.toUpperCase() || "--"}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Content: centered when no header, left-aligned when header present */}
          <div className={`flex flex-col items-center text-center`}>
            {!p.headerImageUrl && (
              profile?.avatarUrl ? (
                <Image
                  src={profile?.avatarUrl}
                  alt={profile?.displayName}
                  width={144}
                  height={144}
                  priority
                  sizes="(min-width: 768px) 144px, 112px"
                  className={`object-cover border-2 border-border mb-4 ${layout === "hero" ? "w-28 h-28 md:w-36 md:h-36 rounded-3xl" : "w-20 h-20 md:w-28 md:h-28 rounded-full"}`}
                />
              ) : (
                <div className={`gradient-primary flex items-center justify-center text-white font-display font-semibold mb-4 ${layout === "hero" ? "w-28 h-28 md:w-36 md:h-36 rounded-3xl text-4xl md:text-5xl" : "w-20 h-20 md:w-28 md:h-28 rounded-full text-3xl md:text-4xl"}`}>
                  {profile?.displayName?.[0]?.toUpperCase()||'--'}
                </div>
              )
            )}

          {p.activeMode && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-2">
              <span>{p.activeMode.emoji}</span>
              {p.activeMode.label} Mode
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl md:text-4xl font-display font-semibold" style={{ color: textColor }}>
              {profile?.displayName}
            </h1>
            <VerifiedBadge level={verificationLevel} size="md" />
          </div>
          <p className="text-sm md:text-base text-muted-foreground mt-0.5">@{profile?.username}</p>
          {profile?.bio && (
            <p className="text-sm md:text-base text-muted-foreground mt-3 leading-relaxed max-w-xs md:max-w-md">{profile?.bio}</p>
          )}
          </div>
        </motion.div>

        {/* Contact action buttons */}
        {contactButtons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="flex flex-wrap gap-2 justify-center mb-6"
          >
            {contactButtons.map(({ label, href, icon: Icon, external }) => (
              <a
                key={label}
                href={href}
                target={external ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all hover:opacity-80 ${buttonRadius} ${buttonBg} card-glow`}
                style={{ color: textColor }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </a>
            ))}

            {/* Save Contact */}
            <button
              onClick={() => downloadVCard({
                displayName: profile?.displayName,
                phone: p.phone,
                email: p.email,
                website: p.website,
                username: profile?.username,
                avatarUrl: profile?.avatarUrl,
              })}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all hover:opacity-80 ${buttonRadius} gradient-primary text-white`}
            >
              <Download className="w-3.5 h-3.5" />
              Save Contact
            </button>
          </motion.div>
        )}

        {/* Save contact if no other contact buttons */}
        {contactButtons.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="flex justify-center mb-6"
          >
            <button
              onClick={() => downloadVCard({
                displayName: profile?.displayName,
                phone: p.phone,
                email: p.email,
                website: p.website,
                username: profile?.username,
              })}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium gradient-primary text-white ${buttonRadius}`}
            >
              <Download className="w-3.5 h-3.5" />
              Save Contact
            </button>
          </motion.div>
        )}

        {/* Link list */}
        <div className="space-y-3">
          {profile?.links?.map((link: { id: string, url: string, title: string }, i: number) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.07 }}
              onClick={() => {
                trackEvent.mutate({
                  data: { profileId: profile?.id, eventType: "click", metadata: { linkId: link?.id } },
                });
              }}
              className={`flex items-center justify-between w-full px-5 py-4 border card-glow hover:card-glow-hover hover:bg-accent transition-all duration-200 group ${buttonBg} ${buttonRadius}`}
              style={{ color: textColor }}
            >
              <span className="font-medium text-sm">{link.title}</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </motion.a>
          ))}
        </div>

        {/* Lead Capture */}
        {leadCaptureEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + (profile?.links?.length || 0) * 0.07 }}
            className="mt-6 p-5 rounded-2xl border border-primary/30 bg-primary/5"
          >
            <h3 className="font-display font-semibold text-sm mb-3">Stay in touch</h3>
            {leadDone ? (
              <p className="text-sm text-primary text-center py-2">Thanks! You'll be in touch soon.</p>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-2.5">
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold gradient-primary text-white transition-opacity hover:opacity-90 disabled:opacity-70 ${buttonRadius}`}
                >
                  {leadSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* Sign-up CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-8"
        >
          <Link
            href="/sign-up"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-semibold text-primary"
          >
            ✦ Get Tapped Inn — Claim Your Free Profile
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-3"
        >
          <button
            onClick={() => setShowQr(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            QR code
          </button>
          <span className="text-muted-foreground/40">·</span>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <div className="w-3.5 h-3.5 rounded gradient-primary flex items-center justify-center">
              <Wifi className="w-2 h-2 text-white" />
            </div>
            {APP_NAME}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
