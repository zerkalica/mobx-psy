import express from 'express'

import { usePsyContextNode } from '@psy/psy/context/provide.node'
import { PsyErrorMix } from '@psy/psy/error/Mix'
import { PsyErrorNotFound } from '@psy/psy/error/NotFound'
import { PsyFetcher } from '@psy/psy/fetcher/Fetcher'
import { PsyLog } from '@psy/psy/log/log'
import { PsySsrTemplate } from '@psy/psy/ssr/Template'

import { AcmeServerManifest } from '../Manifest'

export function acmeServerMdlError(
  error: Error | undefined,
  req: express.Request,
  res: express.Response,
  // Do not remove next in error handler middleware
  next: (arg?: unknown) => unknown
) {
  if (!error) error = new PsyErrorNotFound('Request not handlered')
  let chunk = error.stack
  let log: typeof PsyLog | undefined

  try {
    const $ = usePsyContextNode()
    log = $.get(PsyLog)
    const isRendered = true // error instanceof PsySsrRenderError && error.rendered > 0
    const requestId = $.get(PsyFetcher).requestId()
    if (isRendered) {
      const t = new PsySsrTemplate()

      t.titleText = () => 'Что-то пошло не так'
      t.body = () => `<h2>Что-то пошло не так</h2>
<pre>requestId: ${requestId}</pre>
${$.get(AcmeServerManifest).isDev ? `<pre>${error?.stack ?? 'unk'}</pre>` : ''}
`
      chunk = t.render()
    }
  } catch (e) {
    if (log) log.error({ place: 'acmeServerMdlError#template', message: e })
    else console.error(e)
  } finally {
    if (log) log.error({ place: 'acmeServerMdlError', message: error })
    else console.error(error)
  }

  const nf = error instanceof PsyErrorMix ? error.filterDeep(PsyErrorNotFound)?.[0] : error

  const httpCode = nf instanceof PsyErrorNotFound ? nf.httpCode : 500

  res.status(httpCode).send(chunk)
}
