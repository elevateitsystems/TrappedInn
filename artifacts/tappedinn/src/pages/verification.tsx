import { AppLayout } from "@/components/layout";
import { VerifiedBadge, type VerificationLevel } from "@/components/verified-badge";
import { useGetMyProfile } from "@workspace/api-client-react";
import { Check, ExternalLink, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tier = {
  level: Exclude<VerificationLevel, "none">;
  name: string;
  tagline: string;
  price: string;
  purpose: string;
  perks: string[];
  bestFor: string;
  purchaseUrl: string;
  cardClass: string;
  accentClass: string;
  buttonClass: string;
};

const TIERS: Tier[] = [
  {
    level: "blue",
    name: "Blue Verified",
    tagline: "Authenticity & trust",
    price: "$25",
    purpose:
      "Confirms the creator, artist, entrepreneur, or business is authentic and verified within the Tapped Inn Network.",
    perks: [
      "Official Blue Verified Badge",
      "Verification check beside username",
      "Increased trust on profile",
      "Access to premium profile themes",
      "Priority appearance in searches",
      "“Official Verified Member” status",
      "Lifetime verification ownership",
      "Future verified-only feature access",
      "Access to verified community opportunities",
    ],
    bestFor: "Creators, entrepreneurs, musicians, influencers, freelancers.",
    purchaseUrl:
      "https://tappedinn.net/products/blue-verified-badge?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web",
    cardClass: "border-[#1d9bf0]/30 hover:border-[#1d9bf0]/60",
    accentClass: "text-[#1d9bf0]",
    buttonClass: "bg-[#1d9bf0] hover:bg-[#1d9bf0]/90 text-white",
  },
  {
    level: "gold",
    name: "Gold Verified",
    tagline: "Premium authority",
    price: "$100",
    purpose:
      "For serious brands and businesses wanting elevated authority and premium network status.",
    perks: [
      "Everything in Blue Verified",
      "Gold Verified Badge",
      "Featured placement opportunities",
      "Enhanced profile customization",
      "Premium animated profile effects",
      "Higher visibility in search/discovery",
      "Priority support",
      "Exclusive drops/features access",
      "“Gold Verified Partner” status",
      "Business credibility enhancement",
      "Priority username requests",
    ],
    bestFor: "Businesses, agencies, clothing brands, labels, established creators.",
    purchaseUrl:
      "https://tappedinn.net/products/gold-verified-badge?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web",
    cardClass:
      "border-primary/50 hover:border-primary md:scale-105 md:shadow-[0_0_40px_-10px_hsl(44_54%_54%/0.4)]",
    accentClass: "text-primary",
    buttonClass:
      "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold",
  },
  {
    level: "elite_black",
    name: "Elite Black Verified",
    tagline: "Top-tier exclusivity",
    price: "$250",
    purpose:
      "Highest level of Tapped Inn Network status and exclusivity.",
    perks: [
      "Everything in Gold Verified",
      "Elite Black Verified Badge",
      "Top-tier network recognition",
      "Homepage spotlight opportunities",
      "Concierge setup assistance",
      "Exclusive elite profile themes",
      "First access to future tools/features",
      "Elite-only networking opportunities",
      "Custom profile priority upgrades",
      "Highest search/discovery visibility",
      "“Elite Network Member” status",
      "Early beta access to future platform features",
    ],
    bestFor:
      "High-level brands, executives, influencers, major creators, investors, serious entrepreneurs.",
    purchaseUrl:
      "https://tappedinn.net/products/elite-black-verified?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web",
    cardClass:
      "border-primary/40 hover:border-primary/80 bg-gradient-to-b from-black to-neutral-950",
    accentClass: "text-primary",
    buttonClass:
      "bg-black border border-primary text-primary hover:bg-primary hover:text-black",
  },
];

export default function VerificationPage() {
  const { data: profile } = useGetMyProfile();
  const currentLevel = (profile?.verificationLevel ?? "none") as VerificationLevel;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            TAPPED INN VERIFIED
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Get Verified for Life
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Stand out across the Tapped Inn Network with a lifetime verification badge.
            Boost credibility, unlock premium perks, and rise in search and discovery.
          </p>

          {currentLevel !== "none" && (
            <div className="mt-5 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card border border-primary/30">
              <VerifiedBadge level={currentLevel} size="md" />
              <span className="text-sm">
                You are currently{" "}
                <span className="font-semibold">
                  {currentLevel === "blue"
                    ? "Blue Verified"
                    : currentLevel === "gold"
                    ? "Gold Verified"
                    : "Elite Black Verified"}
                </span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Rank cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TIERS.map((tier, i) => {
            const isCurrent = currentLevel === tier.level;
            return (
              <motion.div
                key={tier.level}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "relative rounded-2xl bg-card border p-6 flex flex-col transition-all",
                  tier.cardClass
                )}
              >
                {tier.level === "gold" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase">
                    Most Popular
                  </div>
                )}

                {/* Badge & name */}
                <div className="flex items-center gap-3 mb-2">
                  <VerifiedBadge level={tier.level} size="lg" />
                  <div>
                    <h2 className="font-display font-bold text-xl leading-tight">
                      {tier.name}
                    </h2>
                    <p className={cn("text-xs font-medium", tier.accentClass)}>
                      {tier.tagline}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-display font-bold">
                      {tier.price}
                    </span>
                    <span className="text-sm text-muted-foreground">lifetime</span>
                  </div>
                </div>

                {/* Purpose */}
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {tier.purpose}
                </p>

                {/* Perks */}
                <ul className="space-y-2 mb-5 flex-1">
                  {tier.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2 text-sm text-foreground/90"
                    >
                      <Check
                        className={cn("w-4 h-4 mt-0.5 shrink-0", tier.accentClass)}
                      />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                {/* Best for */}
                <div className="mb-5 p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Best for
                  </p>
                  <p className="text-sm">{tier.bestFor}</p>
                </div>

                {/* CTA */}
                <a
                  href={tier.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    tier.buttonClass
                  )}
                >
                  {isCurrent ? "You have this rank" : `Get ${tier.name}`}
                  {!isCurrent && <ExternalLink className="w-4 h-4" />}
                </a>
                {!isCurrent && (
                  <p className="text-[11px] text-muted-foreground text-center mt-2">
                    Checkout will collect your Tapped Inn username so we can apply the rank.
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-8 p-5 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">How it works:</span>{" "}
            After purchase, verification is reviewed and applied manually within
            24–48 hours. Make sure to enter the Tapped Inn username or account
            email you want verified at checkout. Verification is{" "}
            <span className="text-foreground font-medium">lifetime</span> — one
            payment, forever.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
