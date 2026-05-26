import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Helper fetcher
const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  if (!res.ok) throw new Error("API Error");
  return res.json();
};

// Profile
export const getGetMyProfileQueryKey = () => ["profile", "me"];
export function useGetMyProfile() {
  return useQuery({ queryKey: getGetMyProfileQueryKey(), queryFn: () => fetcher("/api/profile/me") });
}
export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher("/api/profile/me", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetMyProfileQueryKey() }),
  });
}
export function useGetPublicProfile(username: string, opts?: any) {
  return useQuery({ queryKey: ["profile", username], queryFn: () => fetcher(`/api/profile/${username}`), enabled: opts?.query?.enabled });
}

// Links
export const getGetLinksQueryKey = () => ["links"];
export function useGetLinks() {
  return useQuery({ queryKey: getGetLinksQueryKey(), queryFn: () => fetcher("/api/links") });
}
export function useCreateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { data: any }) => fetcher("/api/links", { method: "POST", body: JSON.stringify(data.data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetLinksQueryKey() }),
  });
}
export function useUpdateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => fetcher(`/api/links/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetLinksQueryKey() }),
  });
}
export function useDeleteLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => fetcher(`/api/links/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetLinksQueryKey() }),
  });
}
export function useReorderLinks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { data: { ids: string[] } }) => fetcher(`/api/links/reorder`, { method: "PUT", body: JSON.stringify(data.data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetLinksQueryKey() }),
  });
}

// Connections
export const getGetConnectionsQueryKey = () => ["connections"];
export function useGetConnections() {
  return useQuery({ queryKey: getGetConnectionsQueryKey(), queryFn: () => fetcher("/api/connections") });
}
export function useDeleteConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => fetcher(`/api/connections/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetConnectionsQueryKey() }),
  });
}

// Analytics
export const getGetProfileAnalyticsQueryKey = (params: any) => ["analytics", params];
export function useGetProfileAnalytics(params: any) {
  const qs = new URLSearchParams(params).toString();
  return useQuery({ queryKey: getGetProfileAnalyticsQueryKey(params), queryFn: () => fetcher(`/api/analytics?${qs}`) });
}
export function useTrackEvent() {
  return useMutation({
    mutationFn: (data: { data: any }) => fetcher(`/api/analytics/track`, { method: "POST", body: JSON.stringify(data.data) }),
  });
}

// Card
export function useGetCard(id: string, opts?: any) {
  return useQuery({ queryKey: ["card", id], queryFn: () => fetcher(`/api/cards/${id}`), enabled: opts?.query?.enabled });
}

// Dashboard
export const getGetDashboardSummaryQueryKey = () => ["dashboard", "summary"];
export function useGetDashboardSummary() {
  return useQuery({ queryKey: getGetDashboardSummaryQueryKey(), queryFn: () => fetcher("/api/dashboard/summary") });
}

export const getGetRecentActivityQueryKey = () => ["dashboard", "activity"];
export function useGetRecentActivity() {
  return useQuery({ queryKey: getGetRecentActivityQueryKey(), queryFn: () => fetcher("/api/dashboard/activity") });
}
