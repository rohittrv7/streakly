const failedEmbedsSet = new Set<string>();

export function markEmbedFailed(externalId: string | null | undefined): void {
  if (externalId) {
    failedEmbedsSet.add(externalId);
  }
}

export function isEmbedFailed(externalId: string | null | undefined): boolean {
  if (!externalId) return false;
  return failedEmbedsSet.has(externalId);
}

export function clearFailedEmbeds(): void {
  failedEmbedsSet.clear();
}
