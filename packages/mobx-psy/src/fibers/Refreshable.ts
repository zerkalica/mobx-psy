export interface Refreshable {
  refresh(): void
  readonly initial: boolean
}

const refreshableKey = Symbol('refreshable')

type AttachedRefreshable<O> = O & {
  [refreshableKey]?: Refreshable
}

export function setRefreshable(
  error: AttachedRefreshable<Error | PromiseLike<any>>,
  refreshable: Refreshable
) {
  error[refreshableKey] = refreshable
}

export function getRefreshable(error: AttachedRefreshable<Error | PromiseLike<any>>) {
  return error[refreshableKey]
}
