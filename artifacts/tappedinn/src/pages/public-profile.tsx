import { useRoute } from "wouter";
import { useGetPublicProfile, useTrackEvent } from "@workspace/api-client-react";
import { useEffect } from "react";
import { Wifi, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

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
        <p className="text-muted-foreground mb-6">This username doesn't exist on TappedInn.</p>
        <Link href="/" className="text-primary hover:underline text-sm">
          Go to TappedInn
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-sm mx-auto">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-8"
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-border mb-4"
            />
          ) : (
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white text-3xl font-display font-semibold mb-4">
              {profile.displayName[0]?.toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-display font-semibold">{profile.displayName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xs">{profile.bio}</p>
          )}
        </motion.div>

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
              transition={{ delay: 0.1 + i * 0.07 }}
              onClick={() => {
                trackEvent.mutate({
                  data: {
                    profileId: profile.id,
                    eventType: "click",
                    metadata: { linkId: link.id },
                  },
                });
              }}
              className="flex items-center justify-between w-full px-5 py-4 rounded-2xl border border-border bg-card card-glow hover:card-glow-hover hover:bg-accent transition-all duration-200 group"
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
            TappedInn
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
