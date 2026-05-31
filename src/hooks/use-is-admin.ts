import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/react";

type WhoamiResponse = {
  isAdmin?: boolean;
};

async function getAdminStatus(): Promise<WhoamiResponse> {
  const response = await fetch("/api/admin/whoami");

  if (response.status === 404) {
    return { isAdmin: false };
  }

  if (!response.ok) {
    throw new Error("Failed to load admin status");
  }

  return response.json();
}

export function useIsAdmin() {
  const { isSignedIn, isLoaded } = useUser();
  const q = useQuery({
    queryKey: ["admin", "whoami"],
    queryFn: getAdminStatus,
    enabled: !!isSignedIn,
    staleTime: 60_000,
  });
  return {
    isLoaded: isLoaded && (!isSignedIn || !q.isLoading),
    isAdmin: !!q.data?.isAdmin,
  };
}
