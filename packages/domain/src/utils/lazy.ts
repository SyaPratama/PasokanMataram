/**
 * Lazy evaluator utilities for memoized singleton initialization.
 * Evaluates the factory exactly once upon first invocation.
 */

/**
 * Creates a lazy synchronous initializer that caches its value after the first call.
 */
export function lazy<T>(factory: () => T): () => T {
  let instance: T | undefined;
  return () => {
    if (instance === undefined) {
      instance = factory();
    }
    return instance;
  };
}

/**
 * Creates a lazy asynchronous initializer that memoizes the pending promise or resolved value.
 */
export function lazyAsync<T>(factory: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return () => {
    if (!promise) {
      promise = factory();
    }
    return promise;
  };
}
