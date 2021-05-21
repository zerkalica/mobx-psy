import express from 'express'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { usePsyContextNode } from '@psy/core/context/provide.node'
import { PsyErrorMix } from '@psy/core/error/Mix'
import { PsyErrorNotFound } from '@psy/core/error/NotFound'
import { PsyLog } from '@psy/core/log/log'
import { PsySsrRenderError } from '@psy/core/ssr/Render.node'
import { PsySsrTemplate } from '@psy/core/ssr/Template'
import { PsyTrace } from '@psy/core/trace/trace'

export function snapServerMdlError(error: Error | undefined, req: express.Request, res: express.Response) {
  if (!error) error = new PsyErrorNotFound('Request not handlered')
  let chunk = error.stack
  let log: typeof PsyLog | undefined

  try {
    const $ = usePsyContextNode()
    log = $.get(PsyLog)

    const template = $.get(PsySsrTemplate.instance)
    const isRendered = error instanceof PsySsrRenderError && error.rendered > 0
    const requestId = $.get(PsyTrace).requestId()

    chunk = `${isRendered ? '' : template.renderBegin()}${template.renderError(error, requestId)}${template.renderEnd()}`
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
