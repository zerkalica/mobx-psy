import React from 'react'
import { usePsyContext, psyContextConfig, usePsyContextMemo } from './context'

function usePsyContextMemoCommon<Result, Args extends unknown[]>(
  deps: Args,
  cl?: new (...args: Args) => Result,
  cb?: (...args: Args) => Result,
): Result {
  const oldDeps = psyContextConfig.deps
  psyContextConfig.deps = deps

  const origUseContext = React.useContext
  React.useContext = usePsyContext

  try {
    const v = cl ? new cl(...deps) : cb!(...deps)
    return usePsyContextMemo(() => v, deps)
  } finally {
    React.useContext = origUseContext
    psyContextConfig.deps = oldDeps
  }
}

export function usePsyContextMemoFn<Result, Args extends unknown[]>(
  cb: (...args: Args) => Result,
  ...propDeps: Args
) {
  return usePsyContextMemoCommon(propDeps, undefined, cb)
}

/**
 * ```tsx
 * import React from 'react'
 * import { usePsyContextMemo } from '@psy/context'
 *
 * const Some = React.createContext('user')
 *
 * class User {
 *   constructor(
 *     protected id: string,
 *     protected some = psyContext(Some)
 *   ) {}
 *   get name() { return this.some + this.id }
 * }
 *
 * function App(p: {id: string}) {
 *   const user = usePsyContextMemo(User, p.id)
 *   return <div>{user.name}</div>
 * }
 * ```
 */
export function usePsyContextMemoClass<Result, Args extends unknown[]>(
  cl: new (...args: Args) => Result,
  ...propDeps: Args
) {
  return usePsyContextMemoCommon(propDeps, cl)
}
