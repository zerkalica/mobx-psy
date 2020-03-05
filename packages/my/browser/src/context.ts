import { FetchLike, fiberizeFetch, HydratedState } from 'mobx-psy'
import { MyRouterLocation } from '@my/router'

export function myBrowserContext({
  fetch: fetchRaw,
  apiUrl = '/',
  pkgName,
  window
}: {
  pkgName: string
  apiUrl: string
  fetch: FetchLike<RequestInit>
  window: Window
}) {
  const location = new MyRouterLocation(window.location, window.history, window)
  const cache = ((window as unknown) as { [pkgName: string]: HydratedState })[pkgName]
  const syncFetch = fiberizeFetch((url, params) => fetchRaw(apiUrl + url, params), cache)
  const id = `${pkgName}-main`
  const container = window.document.getElementById(id)

  if (! container) throw new Error(`Not found container element: <body><div id="${id}"></div>...`)

  return {
    location,
    container,
    fetch: syncFetch
  }
}
