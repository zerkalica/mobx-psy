import { throwHidden } from '@psy/core'

export class DemoLibServerMdlAsyncNext<V> extends Error {
  constructor(readonly next: V) {
    super()
  }
}

const nextStub = (e: any) => {
  throwHidden(new DemoLibServerMdlAsyncNext(e))
}

export function demoLibServerMdlAsync<Req, Res>(
  cb: (req: Req, res: Res, next?: (e?: any) => any) => Promise<unknown>
) {
  return async (req: Req, res: Res, next?: (e?: any) => any) => {
    try {
      const val = await cb(req, res, nextStub)
      if (val instanceof DemoLibServerMdlAsyncNext) throwHidden(val)
    } catch (e) {
      next?.(e instanceof DemoLibServerMdlAsyncNext ? e.next : e)
    }
  }
}
