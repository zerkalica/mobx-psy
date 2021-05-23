import express from 'express'

import { usePsyContextNode } from '@psy/core/context/provide.node'
import { PsyErrorMix } from '@psy/core/error/Mix'
import { PsyErrorNotFound } from '@psy/core/error/NotFound'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { PsyLog } from '@psy/core/log/log'
import { PsySsrRenderError } from '@psy/core/ssr/Render.node'
import { PsySsrTemplate } from '@psy/core/ssr/Template'

export function snapServerMdlError(
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

    const isRendered = error instanceof PsySsrRenderError && error.rendered > 0
    const requestId = $.get(PsyFetcher).requestId()
    if (isRendered) {
      const t = new PsySsrTemplate()

      t.titleText = () => 'Что-то пошло не так'
      t.body = () => `<h2>Что-то пошло не так</h2>
<pre>requestId: ${requestId}</pre>
${process.env.NODE_ENV === 'development' ? `<pre>${error?.stack ?? 'unk'}</pre>` : ''}
`
      chunk = t.render()
    }
  } catch (e) {
    if (log) log.error({ place: 'snapServerMdlError#template', message: e })
    else console.error(e)
  } finally {
    if (log) log.error({ place: 'snapServerMdlError', message: error })
    else console.error(error)
  }

  const nf = error instanceof PsyErrorMix ? error.filterDeep(PsyErrorNotFound)?.[0] : error

  const httpCode = nf instanceof PsyErrorNotFound ? nf.httpCode : 500

  res.status(httpCode).send(chunk)
}
