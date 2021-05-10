import { AsyncLocalStorage } from 'async_hooks'

import { PsyContext, PsyContextUpdater } from './Context'

const store = new AsyncLocalStorage<PsyContext>()

export function usePsyContextNode() {
  const registry = store.getStore()
  if (!registry) throw new Error('Init context in psyContextProvideNode first')

  return registry
}

export function psyContextProvideNode(next: () => void, cb: PsyContextUpdater) {
  const prev = store.getStore() ?? new PsyContext()

  store.run(cb ? prev.clone(cb) : prev, next)
}

export function usePsyContextCreateNode<Result, Args extends unknown[]>(cl: new (...args: Args) => Result, ...args: Args) {
  const ctx = usePsyContextNode()
  const prev = PsyContext.instance
  try {
    PsyContext.instance = ctx
    return new cl(...args)
  } finally {
    PsyContext.instance = prev
  }
}
