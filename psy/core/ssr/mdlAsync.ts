import { psyErrorThrowHidden } from '../error/hidden'
import { psyFunctionName } from '../function/name'

export class PsySsrMdlAsyncNext<V> extends Error {
  constructor(readonly next: V) {
    super()
  }
}

const nextStub = (e: any) => {
  psyErrorThrowHidden(new PsySsrMdlAsyncNext(e))
}

export function psySsrMdlAsync<Req, Res>(cb: (req: Req, res: Res, next: (e?: Error) => never) => Promise<unknown>) {
  return psyFunctionName(async (req: Req, res: Res, next: (e?: any) => any) => {
    try {
      const val = await cb(req, res, nextStub)
      if (val instanceof PsySsrMdlAsyncNext) psyErrorThrowHidden(val)
    } catch (e) {
      const err = e instanceof PsySsrMdlAsyncNext ? e.next : e
      err ? next(err) : next()
    }
  }, cb.name)
}
