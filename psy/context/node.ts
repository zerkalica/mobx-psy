import { AsyncLocalStorage } from 'async_hooks'

import { PsyContextRegistry, PsyContextUpdater } from './Registry'

const store = new AsyncLocalStorage<PsyContextRegistry>()

export function usePsyContextNode() {
  const registry = store.getStore()
  if (!registry) throw new Error('Init context in psyContextProvideNode first')

  return registry
}

export function psyContextProvideNode(next: () => void, cb: PsyContextUpdater) {
  const prev = store.getStore() ?? new PsyContextRegistry()

  store.run(cb ? prev.clone(cb) : prev, next)
}

export function usePsyContextClass<Result, Args extends unknown[]>(
  cl: new (...args: [PsyContextRegistry, ...Args]) => Result,
  ...args: Args
) {
  const registry = usePsyContextNode()

  return new cl(registry, ...args)
}
