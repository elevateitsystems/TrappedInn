import { useGetConnections, useDeleteConnection, getGetConnectionsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { useQueryClient } from "@tanstack/react-query";
import { Users, UserMinus, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function ConnectionsPage() {
  const { data: connections, isLoading } = useGetConnections();
  const deleteConnection = useDeleteConnection();
  const queryClient = useQueryClient();

  const handleRemove = (userId: string) => {
    deleteConnection.mutate(
      { userId },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetConnectionsQueryKey() }) }
    );
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-display font-semibold">Connections</h1>
          <p className="text-muted-foreground mt-1 text-sm">People you've connected with on TappedInn</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : !connections || connections.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No connections yet.</p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Connections form when someone views your profile through an NFC tap.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn, i) => {
              const p = conn.connectedProfile;
              return (
                <motion.div
                  key={conn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card card-glow group"
                >
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.displayName}
                      className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                      {p.displayName[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{p.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{p.username}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Link
                      href={`/p/${p.username}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleRemove(conn.connectedUserId)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
