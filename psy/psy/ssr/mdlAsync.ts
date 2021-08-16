import { psyFunctionName } from '../function/name'

export function psySsrMdlAsync<Req, Res>(cb: (req: Req, res: Res, next: (e?: any) => unknown) => Promise<unknown>) {
  return psyFunctionName(async (req: Req, res: Res, next: (e?: any) => unknown) => {
    try {
      await cb(req, res, next)
    } catch (e) {
      next(e)
    }
  }, cb.name + 'psySsrMdlAsync')
}
