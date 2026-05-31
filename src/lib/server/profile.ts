import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, profilesTable, usersTable, withRetry } from "@/db";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function requireUserId() {
  const { userId } = await auth();

  if (!userId) {
    throw new ApiError("Unauthorized", 401);
  }

  return userId;
}

function normalizeUsername(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
}

export async function ensureCurrentUser() {
  const userId = await requireUserId();
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new ApiError("Unauthorized", 401);
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@tappedinn.local`;

  await withRetry(() =>
    db
      .insert(usersTable)
      .values({
        id: userId,
        email,
      })
      .onConflictDoNothing()
  );

  return { userId, clerkUser, email };
}

export async function getCurrentUserProfile() {
  const userId = await requireUserId();

  return withRetry(() =>
    db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, userId),
    })
  );
}

export async function getOrCreateCurrentUserProfile() {
  const userId = await requireUserId();

  const existing = await withRetry(() =>
    db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, userId),
    })
  );

  if (existing) {
    return existing;
  }

  const { clerkUser, email } = await ensureCurrentUser();

  const displayName =
    clerkUser.fullName || clerkUser.firstName || clerkUser.username || "New User";
  const username = normalizeUsername(clerkUser.username || userId);

  const [created] = await withRetry(() =>
    db
      .insert(profilesTable)
      .values({
        id: crypto.randomUUID(),
        userId,
        username,
        displayName,
        email,
        bio: "",
        themeSettings: {},
        contactSettings: {
          showPhone: true,
          showEmail: true,
          showWebsite: true,
          showSms: false,
          showLocation: true,
        },
        leadCaptureEnabled: false,
        verified: false,
      })
      .returning()
  );

  return created;
}
