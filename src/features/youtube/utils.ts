// YouTube feature utility helpers
export function isValidYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
}
