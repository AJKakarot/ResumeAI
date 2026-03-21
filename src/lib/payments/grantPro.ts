import { clerkClient } from "@clerk/nextjs/server";
import { resolveSubscriptionPlan } from "@/lib/subscriptionPlan";

/**
 * Grant Pro in Clerk public metadata (30-day window from payment success).
 */
export async function grantProToClerkUser(userId: string): Promise<void> {
  const { plan_expiry } = resolveSubscriptionPlan({
    payment_status: "success",
    now: new Date(),
  });
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const prev = (user.publicMetadata ?? {}) as Record<string, unknown>;
  await client.users.updateUser(userId, {
    publicMetadata: {
      ...prev,
      premium: true,
      plan: "pro",
      plan_expiry,
    },
  });
}
