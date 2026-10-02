import { nanoid as nanoidNonSecure } from "nanoid/non-secure";

/**
 * Generates a unique ID using nanoid (non-secure compatible with all JS runtimes).
 */
export function generateId(size: number = 21): string {
  try {
    return nanoidNonSecure(size);
  } catch {
    return (
      Math.random().toString(36).substring(2, 9) +
      Date.now().toString(36)
    );
  }
}

export { nanoidNonSecure as nanoid };
