import { Writable } from 'stream'

type SerializableItem = string | number | null | object
type Serializable = SerializableItem | SerializableItem[]
export type StateItem = [string, Serializable]

export type FetchLike<Init> = <Result>(
  url: string,
  init: Init
) => Promise<Result>

export function stateToScriptTag(pkgName: string, state: StateItem[]): string {
  return `\n<script>window['${pkgName}'] = ${JSON.stringify(state)};</script>\n`
}

export interface ServerRenderOptions<Init> {
  fetch: FetchLike<Init>
  header: string
  body(fetch: FetchLike<Init>): NodeJS.ReadStream | string
  footer(state: StateItem[]): string | Promise<string>
}

/**
 * @example
 *
 * ```tsx
import express from 'express'
import fs from 'fs'
import fetch from 'isomorphic-fetch'
import {serverRender, stateToScriptTag} from 'mobx-psy-ssr'

import {App, pkgName} from './App'

const app = express()

app.get('/', (req, res) => {
  serverRender({
    fetch,
    header: `<html><body>`,
    body: fetch => ReactDOMServer.renderToNodeStream(<App fetch={fetch} />),
    footer: state => `${stateToScriptTag(pkgName, state)}</body></html>`
  }).pipe(res)
})
 ```
 */
export function serverRender<Init>(options: ServerRenderOptions<Init>) {
  const promises: PromiseLike<StateItem>[] = []
  const target = new Writable()

  const normalizedFetch: FetchLike<Init> = <Result>(
    url: string,
    init: Init
  ) => {
    const promise = options.fetch<Result>(url, init)
    promises.push(
      promise.then(data => [url, (data as unknown) as Serializable])
    )
    return promise
  }

  const writeFooter = () => {
    Promise.all(promises)
      .then(options.footer.bind(options))
      .then(chunk => target.end(chunk))
      .catch(error => {
        console.error(error)
        target.end()
      })
    // .catch(error => target.destroy(error))
  }

  target.write(options.header)
  const original = options.body(normalizedFetch)
  if (typeof original === 'string') {
    writeFooter()
  } else {
    original.on('data', chunk => target.write(chunk))
    original.on('error', error => target.destroy(error))
    original.on('end', writeFooter)
  }

  return target
}
