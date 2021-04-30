import { FetchInitBase } from '@psy/core'

export function demoLibIOFetchWrap({ fetchFn, apiUrl }: { apiUrl: string; fetchFn: typeof fetch }) {
  return async (args: FetchInitBase, signal: AbortSignal) => {
    let body = args.params as any

    if (
      body &&
      !(body instanceof Blob) &&
      !(body instanceof FormData) &&
      !(body instanceof URLSearchParams) &&
      !(body instanceof ReadableStream)
    )
      body = JSON.stringify(body)

    const init: RequestInit = {
      ...args,
      signal,
      body,
    }

    const url = apiUrl + args.kind

    const resp = await fetchFn(url, init)

    return resp.json()
  }
}
