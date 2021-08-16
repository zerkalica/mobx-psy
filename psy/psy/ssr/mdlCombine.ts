import { IncomingMessage, ServerResponse } from 'http'

type Mdl = (req: IncomingMessage, res: ServerResponse, next: (err?: any) => any) => void

export function psySsrMdlCombine(...mids: readonly Mdl[]) {
  return mids.reduce((a, b) => {
    return (req, res, next) => {
      try {
        a(req, res, err => {
          if (err) return next(err)

          try {
            b(req, res, next)
          } catch (err) {
            next(err)
          }
        })
      } catch (err) {
        next(err)
      }
    }
  })
}
