/**
 * Retry query controller.
 * Attached to error.
 */
export interface PsySyncRefreshable {
  /**
   * Reset fiber state and retry calculations.
   */
  refresh(): void

  /**
   * Is fiber calculations running first time?
   * Used in @link ../mock.ts to return mock on first run instead of real component
   */
  readonly isFirstRun: boolean
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
