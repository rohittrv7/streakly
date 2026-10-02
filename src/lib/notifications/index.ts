export * from "./types";
export * from "./native";
export * from "./channels";
export * from "./permissions";
export * from "./focus";
export * from "./handlers";
export * from "./plan";
export * from "./diff";
export * from "./reconcile";
export * from "./settings";
export * from "./sync";
export * from "./copy";
export * from "./dev";

import { getPermissionStatus, requestNotificationPermission } from "./permissions";

/** Backward-compatible helper for existing code */
export async function hasNotificationPermission(): Promise<boolean> {
  const perm = await getPermissionStatus();
  return perm.status === "granted";
}

/** Backward-compatible helper for existing code */
export async function ensureNotificationPermission(): Promise<boolean> {
  return requestNotificationPermission();
}
