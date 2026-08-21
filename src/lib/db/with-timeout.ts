// Bounds a promise that has no timeout of its own (e.g. supabase-js's
// auth.getUser(), which doesn't accept an AbortSignal). On a genuinely
// offline connection this tends to fail fast, but on a weak/flaky one -
// the more realistic "bad signal at the gym" case - it can otherwise hang
// far longer than any of our own timeouts.
export function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T | undefined> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(undefined);
      },
    );
  });
}
