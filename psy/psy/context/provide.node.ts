import { AsyncLocalStorage } from 'async_hooks'

import { psySsrMdlAsync } from '../ssr/mdlAsync'
import { PsyContext } from './Context'

const store = new AsyncLocalStorage<PsyContext>()

export function usePsyContextNode(def = PsyContext.instance) {
  return store.getStore() ?? def
}

// function psyContextProvideNode(next: () => void, cb: PsyContextUpdater) {
//   const prev = store.getStore() ?? PsyContext.instance

//   return store.run(cb ? prev.clone(cb) : prev, next)
// }

export function psyContextProvideMdlNode<In, Out>(cb: (req: In, res: Out, ctx: PsyContext) => Promise<PsyContext>) {
  return psySsrMdlAsync(async function psyContextProvideMdlNode$(req: In, res: Out, next: () => any) {
    const parent$ = usePsyContextNode()
    const $ = new PsyContext(parent$)
    await cb(req, res, $)

    return store.run($.isChanged ? $ : parent$, next)
  })
}
