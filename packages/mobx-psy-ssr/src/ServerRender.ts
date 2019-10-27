import { HydratedState, FetchLike } from 'mobx-psy'

export interface ServerRenderOptions<Init> {
  fetch: FetchLike<Init>
  apiUrl: string
  renderOnce?: boolean
  render(
    fetch: FetchLike<Init>,
    cache: HydratedState
  ): NodeJS.ReadableStream | string
  success(html: string, state: HydratedState): void
  error(error: Error): void
}

/**
 * @example
 *
 * ```tsx
import express from 'express'
import fetch from 'isomorphic-fetch'
import {serverRender, stateToScriptTag} from 'mobx-psy-ssr'

import {App} from './App'

const app = express()

app.get('/', (req, res) => {
  new ServerRender({
    fetch,
    render: fetch =>
      ReactDOMServer.renderToNodeStream(
        <App />
      ),
    part(html) {
      res.write(html)
    },
    success(state) {
      res.end(`${footerPre}=${JSON.stringify(state)}${footerPost}`)
    },
    error(error) {
      res.end('' + error)
    },
  }).run()
})
 ```
 */
export class ServerRender<Init> {
  protected promises: PromiseLike<[string, any]>[] = []
  protected cache: HydratedState = {}
  constructor(protected options: ServerRenderOptions<Init>) {}

  protected normalizedFetch<Result>(url: string, init: Init) {
    const promise = this.options.fetch<Result>(this.options.apiUrl + url, init)
    this.promises.push(promise.then(data => [url, data]))
    return promise
  }

  protected render(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const original = this.options.render(
        this.normalizedFetch.bind(this),
        this.cache
      )
      if (typeof original === 'string') return resolve(original)
      const chunks: string[] = []
      original.on('data', (chunk: string | Buffer) => {
        if (chunk) chunks.push('' + chunk)
      })
      original.on('error', (error: Error) => reject(error))
      original.on('end', (chunk: string | Buffer) => {
        if (chunk) chunks.push('' + chunk)
        resolve(chunks.join(''))
      })
    })
  }

  protected getState(): Promise<[string, HydratedState]> {
    return this.render().then(html => {
      if (this.promises.length === 0) return [html, this.cache]

      return Promise.all(this.promises).then(items => {
        for (let [url, data] of items) this.cache[url] = data
        this.promises = []
        if (this.options.renderOnce) return [html, this.cache]
        return this.getState()
      })
    })
  }

  run() {
    this.getState()
      .then(([html, state]) => {
        this.options.success(html, state)
      })
      .catch(error => {
        this.options.error(error)
      })
  }
}
