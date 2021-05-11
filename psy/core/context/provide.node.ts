import { AsyncLocalStorage } from 'async_hooks'

import { PsyContext, PsyContextUpdater } from './Context'

const store = new AsyncLocalStorage<PsyContext>()

export function usePsyContextNode() {
  const registry = store.getStore()
  if (!registry) throw new Error('Init context in psyContextProvideNode first')

  return registry
}

export function psyContextProvideNode(next: () => void, cb: PsyContextUpdater) {
  const prev = store.getStore() ?? PsyContext.instance

  store.run(cb ? prev.clone(cb) : prev, next)
}
