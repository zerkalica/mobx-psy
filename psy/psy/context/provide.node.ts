import { AsyncLocalStorage } from 'async_hooks'

import { psySsrMdlAsync } from '../ssr/mdlAsync'
import { PsyContext, PsyContextUpdater } from './Context'

const store = new AsyncLocalStorage<PsyContext>()

export function usePsyContextNode() {
  const registry = store.getStore()
  if (!registry) throw new Error('Init context in psyContextProvideNode first')

  return registry
}

export function psyContextProvideNode(next: () => void, cb: PsyContextUpdater) {
  const prev = store.getStore() ?? PsyContext.instance

  return store.run(cb ? prev.clone(cb) : prev, next)
}

export function psyContextProvideNodeMdl<Req, Res = unknown>(cb: (ctx: PsyContext, req: Req, res: Res) => Promise<PsyContext>) {
  return psySsrMdlAsync(async function psyContextProvideNodeMdl$(req: Req, res: Res, next) {
    const prev = store.getStore() ?? PsyContext.instance
    const nextCtx = await cb(prev, req, res)

    store.run(nextCtx, next)
  })
}
