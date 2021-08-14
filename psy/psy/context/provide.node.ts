import { AsyncLocalStorage } from 'async_hooks'

import { PsyContext, PsyContextUpdater } from './Context'

const store = new AsyncLocalStorage<PsyContext>()

export function usePsyContextNode(def = PsyContext.instance) {
  return store.getStore() ?? def
}

export function psyContextProvideNode(next: () => void, cb: PsyContextUpdater) {
  const prev = store.getStore() ?? PsyContext.instance

  return store.run(cb ? prev.clone(cb) : prev, next)
}
