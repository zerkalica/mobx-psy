import express from 'express'

import { usePsyContextNode } from '@psy/core/context/provide.node'
import { PsyErrorNotFound } from '@psy/core/error/NotFound'
import { PsyLog } from '@psy/core/log/log'
import { PsyTrace } from '@psy/core/trace/trace'

export function snapServerMdlError({ template }: { template: (error: Error, requestId: string) => string }) {
  return function snapServerMdlError$(error: Error | null | undefined, req: express.Request, res: express.Response) {
    const ctx = usePsyContextNode()
    const log = ctx.get(PsyLog)
    const trace = ctx.get(PsyTrace)

    if (!error) error = new PsyErrorNotFound('Request not handlered')

    log.error({ place: 'snapServerMdlError', message: error })
    const httpCode = error instanceof PsyErrorNotFound ? error.httpCode : 500
    const requestId = trace.requestId()

    res.status(httpCode).send(template(error, requestId))
  }
}
