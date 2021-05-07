import fetch, { BodyInit as NodeBodyInit, RequestInit as NodeRequestInit } from 'node-fetch'

import { Fetcher, FetchInitBase } from './Fetcher'

import type { AbortSignal as NodeAbortSignal } from 'node-fetch/externals'

export class FetcherServer extends Fetcher {
  constructor(protected apiUrl = '') {
    super()
  }

  async get(args: FetchInitBase, signal: AbortSignal) {
    const body = this.serializeBody(args.params)

    const init: NodeRequestInit = {
      ...args,
      signal: signal as NodeAbortSignal,
      body: body as NodeBodyInit,
    }

    const url = this.apiUrl + args.kind

    const resp = await fetch(url, init)

    return resp.json()
  }
}
