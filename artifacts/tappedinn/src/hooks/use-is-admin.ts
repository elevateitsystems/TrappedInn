import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { useUser } from "@clerk/react";

export function useIsAdmin() {
  const { isSignedIn, isLoaded } = useUser();
  const q = useQuery({
    queryKey: ["admin", "whoami"],
    queryFn: () => adminApi.whoami(),
    enabled: !!isSignedIn,
    staleTime: 60_000,
  });
  return {
    isLoaded: isLoaded && (!isSignedIn || !q.isLoading),
    isAdmin: !!q.data?.isAdmin,
  };
}
