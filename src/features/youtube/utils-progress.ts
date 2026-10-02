import type { TaskLink } from "./types";

export interface LinksProgress {
  watched: number;
  total: number;
  ratio: number;
}

/**
 * Calculates watched progress across links for a task.
 * Rules:
 * - A container playlist with children counts ONLY its children (watched / total).
 * - A container playlist without children keeps its manual stepper (playlistDone / playlistTotal).
 * - Standalone videos (not children of any container in the list) count as 1 item (0 or 1).
 * - Child videos are never double-counted outside their container.
 */
export function getLinksProgress(links: TaskLink[]): LinksProgress {
  if (!links || links.length === 0) {
    return { watched: 0, total: 0, ratio: 0 };
  }

  // Find all container playlist IDs
  const playlistIds = new Set(
    links.filter((l) => l.kind === "playlist").map((l) => l.id)
  );

  // Group children by parentLinkId
  const childrenByParent = new Map<string, TaskLink[]>();
  for (const l of links) {
    if (l.parentLinkId && playlistIds.has(l.parentLinkId)) {
      const arr = childrenByParent.get(l.parentLinkId) || [];
      arr.push(l);
      childrenByParent.set(l.parentLinkId, arr);
    }
  }

  let watched = 0;
  let total = 0;

  for (const l of links) {
    if (l.kind === "playlist") {
      const children = childrenByParent.get(l.id);
      if (children && children.length > 0) {
        // Count ONLY children
        total += children.length;
        watched += children.filter((c) => c.watched).length;
      } else {
        // Manual stepper
        const pTotal = l.playlistTotal || 0;
        const pDone = l.playlistDone || 0;
        if (pTotal > 0) {
          total += pTotal;
          watched += Math.min(pDone, pTotal);
        }
      }
    } else if (!l.parentLinkId || !playlistIds.has(l.parentLinkId)) {
      // Standalone video (not a child of any playlist container in this list)
      total += 1;
      if (l.watched) watched += 1;
    }
  }

  return {
    watched,
    total,
    ratio: total === 0 ? 0 : watched / total,
  };
}

/**
 * Returns the next unwatched link for a task.
 * If a container has children, returns the first unwatched child in position order.
 */
export function getNextUnwatchedLink(links: TaskLink[]): TaskLink | null {
  if (!links || links.length === 0) return null;

  const playlistIds = new Set(
    links.filter((l) => l.kind === "playlist").map((l) => l.id)
  );

  // Group children by parentLinkId and sort by position
  const childrenByParent = new Map<string, TaskLink[]>();
  for (const l of links) {
    if (l.parentLinkId && playlistIds.has(l.parentLinkId)) {
      const arr = childrenByParent.get(l.parentLinkId) || [];
      arr.push(l);
      childrenByParent.set(l.parentLinkId, arr);
    }
  }

  // 1. Standalone videos first
  const nextStandalone = links.find(
    (l) => l.kind !== "playlist" && !l.parentLinkId && !l.watched
  );
  if (nextStandalone) return nextStandalone;

  // 2. Child videos of containers in position order
  for (const l of links) {
    if (l.kind === "playlist") {
      const children = childrenByParent.get(l.id);
      if (children && children.length > 0) {
        const sorted = [...children].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        const nextChild = sorted.find((c) => !c.watched);
        if (nextChild) return nextChild;
      }
    }
  }

  // 3. Manual playlist containers without children (steppers where done < total)
  for (const l of links) {
    if (l.kind === "playlist") {
      const children = childrenByParent.get(l.id);
      if (!children || children.length === 0) {
        const total = l.playlistTotal || 0;
        const done = l.playlistDone || 0;
        if (total === 0 || done < total) return l;
      }
    }
  }

  return null;
}
