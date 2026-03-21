import { clerkClient } from "@clerk/nextjs/server";

/** Clear Pro flags (e.g. admin revoke or future subscription end). */
export async function revokeProFromClerkUser(userId: string): Promise<void> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const prev = (user.publicMetadata ?? {}) as Record<string, unknown>;
  await client.users.updateUser(userId, {
    publicMetadata: {
      ...prev,
      premium: false,
      plan: "free",
      plan_expiry: null,
    },
  });
}
