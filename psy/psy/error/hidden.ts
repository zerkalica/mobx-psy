/**
 * Helps to disable pause in chrome dev tools while error rethrow
 */
export function psyErrorThrowHidden(error: Error | PromiseLike<any>): never {
  throw error // Set Never pause here in chrome devtools
}
