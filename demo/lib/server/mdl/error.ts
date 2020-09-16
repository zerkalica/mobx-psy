import express from 'express'

import { HttpError } from '@psy/core'

export function demoLibServerMdlError(
  err: Error | null,
  req: express.Request,
  res: express.Response,
  next?: express.NextFunction
) {
  if (!err) {
    if (next) next()
    return
  }

  console.error(err)

  if (HttpError.is(err)) {
    res.status(err.code).send(err.message)
    return
  }

  res.status(500).send(err.message)
}
