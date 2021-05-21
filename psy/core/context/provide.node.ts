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

export function psyContextProvideNodeMdl<Req, Res = unknown>(cb: (req: Req, ctx: PsyContext) => Promise<PsyContext>) {
  return psySsrMdlAsync(async (req: Req, res: Res) => {
    const prev = store.getStore() ?? PsyContext.instance
    const nextCtx = await cb(req, prev)

    return new Promise(resolve => store.run(nextCtx, resolve))
  })
}
