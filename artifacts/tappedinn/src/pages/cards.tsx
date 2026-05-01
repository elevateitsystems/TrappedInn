import { useState } from "react";
import {
  useGetCards,
  useCreateCard,
  useDeleteCard,
  getGetCardsQueryKey,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, Plus, Trash2, Copy, Check, Wifi, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CardsPage() {
  const { data: cards, isLoading } = useGetCards();
  const createCard = useCreateCard();
  const deleteCard = useDeleteCard();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel] = useState("");
  const [nfcUid, setNfcUid] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCard.mutate(
      { data: { label: label || null, nfcUid: nfcUid || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCardsQueryKey() });
          setLabel("");
          setNfcUid("");
          setShowCreate(false);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteCard.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCardsQueryKey() }) }
    );
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const input = "w-full px-4 py-2.5 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm";

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-display font-semibold">NFC Cards</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create a card, copy its URL, and write it to your NFC chip using NFC Tools.
          </p>
        </motion.div>

        {/* How it works */}
        <div className="mb-6 p-4 rounded-xl border border-border bg-card/50 text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">How NFC cards work</p>
          <p>1. Create a card below to generate a redirect URL</p>
          <p>2. Write the URL to your NFC chip using the NFC Tools app</p>
          <p>3. When someone taps the card, they're instantly taken to your profile</p>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreate}
              className="mb-4 p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3 overflow-hidden"
            >
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={input}
                placeholder="Card label (optional, e.g. Business card)"
              />
              <input
                type="text"
                value={nfcUid}
                onChange={(e) => setNfcUid(e.target.value)}
                className={input}
                placeholder="NFC chip UID (optional)"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createCard.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {createCard.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate card"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all mb-4"
          >
            <Plus className="w-4 h-4" />
            Generate new card
          </button>
        )}

        {/* Cards list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : !cards || cards.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No cards yet.</p>
            <p className="text-muted-foreground/70 text-xs mt-1">Generate your first card to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-4 rounded-2xl border border-border bg-card card-glow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <Wifi className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{card.label ?? "Unnamed card"}</p>
                      {card.nfcUid && (
                        <p className="text-xs text-muted-foreground font-mono">UID: {card.nfcUid}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
                  <p className="flex-1 text-xs font-mono text-muted-foreground truncate">{card.redirectUrl}</p>
                  <button
                    onClick={() => copyUrl(card.redirectUrl, card.id)}
                    className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    {copiedId === card.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Created {new Date(card.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
