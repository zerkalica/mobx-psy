import { AsyncLocalStorage } from 'async_hooks'
import { psyContextConfig } from './context'

const store = new AsyncLocalStorage<ReturnType<NonNullable<typeof psyContextConfig['store']>['getStore']>>()
psyContextConfig.store = store

export function psyContextInit(next: () => void) {
  store.run(new Map(), next)
}
