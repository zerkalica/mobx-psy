import express from 'express'

export function demoLibServerMdlError(err: (Error & { httpCode?: number }) | null, req: express.Request, res: express.Response) {
  if (!err) err = new Error('Not handlered')

  console.error(err)

  res.status(err.httpCode ?? 500).send(err.message ?? 'Unknown error')
}
