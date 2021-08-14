import React from 'react'

import { PsyContext, PsyContextUpdater } from '@psy/psy/context/Context'

import { PsyContextReact } from './context'

export function PsyContextProvide(p: { children: React.ReactNode; deps?: PsyContextUpdater; parent?: PsyContext }) {
  const prevDeps = p.parent ?? React.useContext(PsyContextReact)
  const prevDepsRef = React.useRef(prevDeps)
  const nextDeps = p.deps === undefined ? prevDepsRef.current : prevDepsRef.current.clone(p.deps)
  prevDepsRef.current = nextDeps

  return <PsyContextReact.Provider value={nextDeps}>{p.children}</PsyContextReact.Provider>
}
