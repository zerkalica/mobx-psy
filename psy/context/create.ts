import React from 'react'

import { psyContextProvide, usePsyContext } from './context'

export function psyContextCreate<V>(
  displayName: string,
  v?: V
): Pick<React.Context<V>, 'Provider' | 'displayName'> & {
  provide(v: V): void
  use(): V
} {
  const ctx = React.createContext(accessAssert(displayName, v))
  ctx.displayName = displayName

  const use = () => usePsyContext(ctx)
  use.displayName = `${displayName}.use`

  const provide = (v: V) => psyContextProvide(ctx, v)
  provide.displayName = `${displayName}.provide`

  Object.defineProperty(ctx.Provider, 'name', { value: provide.displayName, writable: true })

  return { Provider: ctx.Provider, provide, displayName: ctx.displayName, use }
}

function accessAssert<V extends Object>(displayName: string, v: V | undefined): V {
  if (v !== undefined) return v

  return new Proxy({} as V, {
    get(t, key) {
      throw new Error(`Provide context ${displayName}`)
    },
    apply(t, thisVal, args) {
      throw new Error(`Provide context ${displayName}`)
    },
  })
}
