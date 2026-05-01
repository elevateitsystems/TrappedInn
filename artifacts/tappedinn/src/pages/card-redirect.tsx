import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetCard, useTrackEvent } from "@workspace/api-client-react";
import { Wifi } from "lucide-react";

export default function CardRedirectPage() {
  const [, params] = useRoute("/card/:id");
  const cardId = params?.id ?? "";
  const [, setLocation] = useLocation();

  const { data: card, isError } = useGetCard(cardId, {
    query: { enabled: !!cardId },
  });
  const trackEvent = useTrackEvent();

  useEffect(() => {
    if (card) {
      trackEvent.mutate({
        data: {
          profileId: card.profileId,
          eventType: "tap",
          metadata: { cardId: card.id },
        },
      });
      // Redirect to profile — the redirectUrl is the full card URL,
      // but we need to redirect to the profile page
      // We'll fetch the profile username via the redirectUrl pattern
      // For now redirect to the public profile using the card's profile data
      setTimeout(() => {
        // card.redirectUrl is like https://host/card/id — we need /p/username
        // Since we don't have username directly, redirect to the API to get it
        // Actually let's use a simpler approach: redirect to /api/cards/:id which
        // will resolve. Instead, just navigate to a loading state and use profileId
        // For the best UX, we pass through the redirectUrl of the card
        // which will bring them back here unless the server does a real redirect.
        // Best approach: redirect to the profile page by finding username.
        // The card has profileId, not username. We'll redirect to a temporary page.
        // For now navigate to /p/ via the API response.
        // Since we don't have the username from card data, we redirect via the API.
        window.location.href = `/api/cards/${cardId}/redirect`;
      }, 500);
    }
  }, [card]);

  if (isError) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-xl font-display font-semibold mb-2">Card not found</h1>
        <p className="text-muted-foreground text-sm">This NFC card doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-6">
        <Wifi className="w-6 h-6 text-white animate-pulse" />
      </div>
      <h1 className="text-xl font-display font-semibold mb-2">Connecting...</h1>
      <p className="text-muted-foreground text-sm">Taking you to the profile</p>
    </div>
  );
}
