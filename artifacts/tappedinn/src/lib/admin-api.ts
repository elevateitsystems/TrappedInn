const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

async function req<T>(
  path: string,
  init: RequestInit = {},
  getToken?: () => Promise<string | null>,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (getToken) {
    const tok = await getToken();
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
  }
  const res = await fetch(`${BASE_URL}/api/admin${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export type AdminUserRow = {
  userId: string;
  email: string;
  isAdmin: boolean;
  accountStatus: "active" | "suspended" | "disabled";
  createdAt: string;
  profileId: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  verificationLevel: "none" | "blue" | "gold" | "elite_black" | null;
  verifiedAt: string | null;
  verificationType: string | null;
};

export type AdminStats = {
  totalUsers: number;
  totalProfiles: number;
  verifiedUsers: number;
  pendingOrders: number;
  newSignups7d: number;
  taps7d: number;
};

export type AdminSignup = {
  userId: string;
  email: string;
  createdAt: string;
  username: string | null;
  displayName: string | null;
  verificationLevel: string | null;
};

export type AdminOrder = {
  id: string;
  userId: string | null;
  username: string | null;
  email: string | null;
  tier: "blue" | "gold" | "elite_black";
  status: "pending" | "approved" | "rejected" | "refunded";
  source: string;
  externalOrderId: string | null;
  amountCents: string | null;
  notes: string | null;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
};

export type AdminActivityRow = {
  id: string;
  adminUserId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export const adminApi = {
  whoami: () => req<{ isAdmin: boolean }>("/whoami"),
  stats: () => req<AdminStats>("/stats"),
  users: (params: {
    q?: string;
    limit?: number;
    offset?: number;
    status?: string;
    verification?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.offset) qs.set("offset", String(params.offset));
    if (params.status) qs.set("status", params.status);
    if (params.verification) qs.set("verification", params.verification);
    return req<{ users: AdminUserRow[]; total: number; limit: number; offset: number }>(
      `/users?${qs.toString()}`,
    );
  },
  userDetail: (userId: string) =>
    req<{ user: any; profile: any; links: any[]; tapCount: number }>(`/users/${userId}`),
  signups: () => req<{ signups: AdminSignup[] }>("/signups"),
  setVerification: (userId: string, level: string, type = "lifetime") =>
    req(`/users/${userId}/verification`, {
      method: "PUT",
      body: JSON.stringify({ verificationLevel: level, verificationType: type }),
    }),
  setStatus: (userId: string, accountStatus: string) =>
    req(`/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ accountStatus }),
    }),
  setAdmin: (userId: string, isAdmin: boolean) =>
    req(`/users/${userId}/admin`, {
      method: "PUT",
      body: JSON.stringify({ isAdmin }),
    }),
  orders: (status?: string) =>
    req<{ orders: AdminOrder[] }>(`/orders${status ? `?status=${status}` : ""}`),
  createOrder: (body: Partial<AdminOrder>) =>
    req<AdminOrder>("/orders", { method: "POST", body: JSON.stringify(body) }),
  updateOrder: (orderId: string, body: { status: string; applyVerification?: boolean }) =>
    req<AdminOrder>(`/orders/${orderId}`, { method: "PUT", body: JSON.stringify(body) }),
  activity: () => req<{ activity: AdminActivityRow[] }>("/activity"),
};
