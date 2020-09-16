import { FetchLike, suspendify, HydratedState, FetchInitBase } from '@psy/core'
import { DemoLibRouterLocation } from '@demo/lib-router/location'

export function demoLibBrowserContext<Init extends FetchInitBase>({
  fetch: fetchRaw,
  apiUrl = '/',
  pkgName,
  window
}: {
  pkgName: string
  apiUrl: string
  fetch: FetchLike<Init>
  window: Window
}) {
  const location = new DemoLibRouterLocation(window.location, window.history, window)
  const cache = ((window as unknown) as { [pkgName: string]: HydratedState })[pkgName]
  const syncFetch = suspendify<Init>((url, params) => fetchRaw(apiUrl + url, params), cache)
  const id = `${pkgName}-main`
  const container = window.document.getElementById(id)

  if (! container) throw new Error(`Not found container element: <body><div id="${id}"></div>...`)

  return {
    location,
    container,
    fetch: syncFetch
  }
}
