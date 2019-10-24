export interface Refreshable {
  refresh(): void
}

const refreshableKey = Symbol('refreshable')

type AttachedRefreshable<O> = O & {
  [refreshableKey]?: Refreshable
}

export function setRefresh(
  error: AttachedRefreshable<Error | PromiseLike<any>>,
  refreshable: Refreshable
) {
  error[refreshableKey] = refreshable
}

export function getRefresh(error: AttachedRefreshable<Error | PromiseLike<any>>) {
  return error[refreshableKey]
}
