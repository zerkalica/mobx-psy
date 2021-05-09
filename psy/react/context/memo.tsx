import React from 'react'

import { PsyContext } from '@psy/core/context/Context'

import { PsyContextReact } from './context'

/**
 * ```tsx
 * import React from 'react'
 * import { usePsyContextMemo } from '@psy/context'
 *
 * const Some = React.createContext('user')
 *
 * class User {
 *   constructor(
 *     protected $: PsyContextRegistry,
 *     protected id: string,
 *     protected some = $.v(Some)
 *   ) {}
 *
 *   get name() { return this.some + this.id }
 * }
 *
 * function App(p: {id: string}) {
 *   const user = usePsyMemoClass(User, p.id)
 *   return <div>{user.name}</div>
 * }
 * ```
 */

export function usePsyContextMemo<Result, Args extends unknown[]>(cl: new (...args: [PsyContext, ...Args]) => Result, ...propDeps: Args) {
  const registry = React.useContext(PsyContextReact)
  const dep = React.useMemo(() => new cl(registry, ...propDeps), [...propDeps, registry])

  return dep
}
