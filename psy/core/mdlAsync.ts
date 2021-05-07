import { throwHidden } from './common'

export class PsyMdlAsyncNext<V> extends Error {
  constructor(readonly next: V) {
    super()
  }
}

const nextStub = (e: any) => {
  throwHidden(new PsyMdlAsyncNext(e))
}

export function psyMdlAsync<Req, Res>(cb: (req: Req, res: Res, next?: (e?: any) => any) => Promise<unknown>) {
  return async (req: Req, res: Res, next: (e?: any) => any) => {
    try {
      const val = await cb(req, res, nextStub)
      if (val instanceof PsyMdlAsyncNext) throwHidden(val)
    } catch (e) {
      const err = e instanceof PsyMdlAsyncNext ? e.next : e
      err ? next(err) : next()
    }
  }
}
