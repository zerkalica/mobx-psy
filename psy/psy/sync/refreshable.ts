/**
 * Retry query controller.
 * Attached to error.
 */
export interface PsySyncRefreshable {
  /**
   * Reset fiber state and retry calculations.
   */
  refresh(): unknown
}

const refreshableKey = Symbol('psySyncRefreshable')

type AttachedRefreshable<O> = O & {
  [refreshableKey]?: PsySyncRefreshable
}

/**
 * Get fiber, associated with error or promise.
 */
export function psySyncRefreshable(
  error: AttachedRefreshable<Error | PromiseLike<unknown>>,
  refreshable?: PsySyncRefreshable
): PsySyncRefreshable | undefined {
  if (refreshable) error[refreshableKey] = refreshable
  return error[refreshableKey]
}
