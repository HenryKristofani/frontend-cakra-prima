export function isNextRedirectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('digest' in error)) {
    return false;
  }
  const digest = (error as Record<string, unknown>).digest;
  return typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT');
}
