import React, { useContext, Context } from 'react'
import { PsyContextFlatten } from './Flatten'

export const psyContextConfig = {
  store: undefined as {
    getStore(): Map<React.Provider<any>, any> | undefined
  } | undefined,
  deps: undefined as undefined | any[]
}

const rds = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher as { current?: Object }

export function psyContextProvide<V>(ctx: Context<V>, value: V) {
  if (rds.current) throw new Error('In react components use react context provider')

  const st = psyContextConfig.store?.getStore()
  if (!st) throw new Error(`use psyContextInit(${ctx.displayName}) in middleware first`)

  st.set(ctx.Provider, value)
}

function usePsyContextInt<V>(ctx: Context<V>): V {
  if (rds.current) return useContext(ctx)

  const st = psyContextConfig.store?.getStore()
  if (!st) throw new Error(`use psyContextInit(${ctx.displayName}) in middleware first`)
  if (!st.has(ctx.Provider)) throw new Error(`use psyContextProvide to provide ${ctx.displayName}`)

  return st.get(ctx.Provider)
}

export function usePsyContext<V>(ctx: Context<V>): V {
  const dep = usePsyContextInt(ctx)

  if (psyContextConfig.deps) psyContextConfig.deps.push(dep)

  return dep
}

export function psyContextPassProvider() {
  const st = psyContextConfig.store?.getStore()
  return new PsyContextFlatten(st).Provider
}

export function usePsyContextMemo<V>(cb: () => V, deps: any[]): V {
  if (rds.current) return React.useMemo(cb, deps)

  const st = psyContextConfig.store?.getStore()
  if (!st) throw new Error(`use psyContextInit() in middleware first`)

  return cb()
}
