import React from 'react'

import { PsyContextRegistry, PsyContextUpdater } from './Registry'

const PsyContextReact = React.createContext(PsyContextRegistry.root)
PsyContextReact.displayName = 'PsyReactContext'

export function PsyContextProvide(p: { children: React.ReactNode; deps?: PsyContextUpdater; parent?: PsyContextRegistry }) {
  const prevDeps = p.parent ?? React.useContext(PsyContextReact)
  const prevDepsRef = React.useRef(prevDeps)
  const nextDeps = p.deps === undefined ? prevDepsRef.current : prevDepsRef.current.clone(p.deps)
  prevDepsRef.current = nextDeps

  return <PsyContextReact.Provider value={nextDeps}>{p.children}</PsyContextReact.Provider>
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
export function usePsyContextClass<Result, Args extends unknown[]>(
  cl: new (...args: [PsyContextRegistry, ...Args]) => Result,
  ...propDeps: Args
) {
  const registry = React.useContext(PsyContextReact)
  const dep = React.useMemo(() => new cl(registry, ...propDeps), [...propDeps, registry])

  return dep
}
