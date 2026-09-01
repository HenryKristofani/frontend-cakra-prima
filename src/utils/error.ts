export function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as Record<string, unknown>).digest === 'string' &&
    (error as Record<string, unknown>).digest.startsWith('NEXT_REDIRECT')
  );
}
