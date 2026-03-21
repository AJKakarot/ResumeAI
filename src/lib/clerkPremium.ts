import { resolveSubscriptionPlan } from "@/lib/subscriptionPlan";

/**
 * Pro / premium access for gated features (Gemini polish, etc.).
 * Clerk `publicMetadata` may include `plan_expiry` (ISO string). Pro expires after that instant.
 *
 * **Default:** New users have no `premium` / `plan` → **Free** until payment (`grantPro`) or manual set.
 */
export function isPremiumPublicMetadata(
  meta: Record<string, unknown> | undefined | null
): boolean {
  if (!meta || typeof meta !== "object") return false;
  const plan = typeof meta.plan === "string" ? meta.plan : null;
  const plan_expiry = typeof meta.plan_expiry === "string" ? meta.plan_expiry : null;
  const resolved = resolveSubscriptionPlan({
    stored_plan: plan,
    stored_premium: meta.premium === true ? true : meta.premium === false ? false : null,
    plan_expiry,
  });
  return resolved.plan === "pro";
}

/** UI label: everyone is Free unless they qualify as Pro. */
export function getUserPlanLabel(meta: Record<string, unknown> | undefined | null): "Pro" | "Free" {
  return isPremiumPublicMetadata(meta) ? "Pro" : "Free";
}
