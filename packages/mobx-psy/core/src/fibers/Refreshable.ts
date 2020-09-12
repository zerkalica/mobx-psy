/**
 * Retry query controller.
 * Attached to error.
 */
export interface Refreshable {
  /**
   * Reset fiber state and retry calculations.
   */
  refresh(): void

  /**
   * Is fiber calculations running first time?
   * Used in ../mobx-react/mock.ts to return mock on first run instead of real component
   */
  readonly isFirstRun: boolean
}

const refreshableKey = Symbol('refreshable')

type AttachedRefreshable<O> = O & {
  [refreshableKey]?: Refreshable
}

/**
 * Associate fiber with error or promise
 */
export function setRefreshable(
  error: AttachedRefreshable<Error | PromiseLike<unknown>>,
  refreshable: Refreshable
) {
  error[refreshableKey] = refreshable
}

/**
 * Get fiber, associated with error or promise.
 */
export function getRefreshable(error: AttachedRefreshable<Error | PromiseLike<unknown>>): Refreshable | undefined {
  return error[refreshableKey]
}
