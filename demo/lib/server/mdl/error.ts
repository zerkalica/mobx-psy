import express from 'express'

import { usePsyContextNode } from '@psy/core/context/provide.node'
import { psyErrorExtra } from '@psy/core/error/extra'
import { PsyLog } from '@psy/core/log/log'

export function demoLibServerMdlError(error: Error | null | undefined, req: express.Request, res: express.Response) {
  const ctx = usePsyContextNode()
  const log = ctx.get(PsyLog)

  if (!error) {
    error = new Error('Request not handlered')
    psyErrorExtra(error, { httpCode: 404 })
  }

  log.error({ place: 'demoLibServerMdlError', error })

  const extra = psyErrorExtra(error)

  const httpCode = extra?.httpCode ?? 500
  res.status(httpCode).send(error.message ?? 'Unknown error')
}
