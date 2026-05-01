import { useRoute } from "wouter";
import { useGetPublicProfile, useTrackEvent } from "@workspace/api-client-react";
import { useEffect } from "react";
import { Wifi, ExternalLink, Phone, Mail, Globe } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const APP_NAME = "Tapped Inn Network";

export default function PublicProfilePage() {
  const [, params] = useRoute("/p/:username");
  const username = params?.username ?? "";

  const { data: profile, isLoading, isError } = useGetPublicProfile(username, {
    query: { enabled: !!username },
  });
  const trackEvent = useTrackEvent();

  useEffect(() => {
    if (profile?.id) {
      trackEvent.mutate({ data: { profileId: profile.id, eventType: "view" } });
    }
  }, [profile?.id]);

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
        <Link href="/" className="text-primary hover:underline text-sm">
          Go to {APP_NAME}
        </Link>
      </div>
    );
  }

  const ts = (profile as any).themeSettings ?? {};
  const cs = (profile as any).contactSettings ?? { showPhone: true, showEmail: true, showWebsite: true };
  const phone = (profile as any).phone as string | undefined;
  const email = (profile as any).email as string | undefined;
  const website = (profile as any).website as string | undefined;

  const bgColor = ts.backgroundColor || undefined;
  const textColor = ts.textColor || undefined;
  const buttonStyle = ts.buttonStyle ?? "rounded";
  const layout = ts.layout ?? "classic";

  const buttonRadius =
    buttonStyle === "rounded" ? "rounded-full" :
    buttonStyle === "square" ? "rounded-none" :
    "rounded-xl";

  const buttonBg =
    buttonStyle === "outline"
      ? "bg-transparent border-2"
      : "bg-card border border-border";

  const contactButtons = [
    phone && cs.showPhone && { label: "Call", href: `tel:${phone}`, icon: Phone },
    email && cs.showEmail && { label: "Email", href: `mailto:${email}`, icon: Mail },
    website && cs.showWebsite && { label: "Website", href: website, icon: Globe },
  ].filter(Boolean) as { label: string; href: string; icon: React.ElementType }[];

  return (
    <div
      className="min-h-dvh flex items-start justify-center px-4 py-16"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="w-full max-w-sm mx-auto">
        {/* Avatar + info */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col items-center text-center ${layout === "hero" ? "mb-6" : "mb-8"}`}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className={`object-cover border-2 border-border mb-4 ${layout === "hero" ? "w-28 h-28 rounded-3xl" : "w-20 h-20 rounded-full"}`}
            />
          ) : (
            <div className={`gradient-primary flex items-center justify-center text-white font-display font-semibold mb-4 ${layout === "hero" ? "w-28 h-28 rounded-3xl text-4xl" : "w-20 h-20 rounded-full text-3xl"}`}>
              {profile.displayName[0]?.toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-display font-semibold" style={{ color: textColor }}>{profile.displayName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xs">{profile.bio}</p>
          )}
        </motion.div>

        {/* Contact buttons */}
        {contactButtons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="flex gap-2 justify-center mb-6"
          >
            {contactButtons.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={label === "Website" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all hover:opacity-80 ${buttonRadius} ${buttonBg} card-glow`}
                style={{ color: textColor }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </a>
            ))}
          </motion.div>
        )}

        {/* Links */}
        <div className="space-y-3">
          {profile.links.map((link, i) => (
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
                  data: {
                    profileId: profile.id,
                    eventType: "click",
                    metadata: { linkId: link.id },
                  },
                });
              }}
              className={`flex items-center justify-between w-full px-5 py-4 border card-glow hover:card-glow-hover hover:bg-accent transition-all duration-200 group ${buttonBg} ${buttonRadius}`}
              style={{ color: textColor, backgroundColor: bgColor ? undefined : undefined }}
            >
              <span className="font-medium text-sm">{link.title}</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </motion.a>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <div className="w-4 h-4 rounded gradient-primary flex items-center justify-center">
              <Wifi className="w-2 h-2 text-white" />
            </div>
            {APP_NAME}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
