import express from 'express'

import { usePsyContextNode } from '@psy/core/context/provide.node'
import { PsyErrorNotFound } from '@psy/core/error/NotFound'
import { PsyLog } from '@psy/core/log/log'

export function demoLibServerMdlError(error: Error | null | undefined, req: express.Request, res: express.Response) {
  const ctx = usePsyContextNode()
  const log = ctx.get(PsyLog)

  if (!error) error = new PsyErrorNotFound('Request not handlered')

  log.error({ place: 'demoLibServerMdlError', error })

  const httpCode = error instanceof PsyErrorNotFound ? error.httpCode : 500
  res.status(httpCode).send(error.message ?? 'Unknown error')
}
