import React from 'react'

import { PsyContext, PsyContextUpdater } from '@psy/psy/context/Context'

import { PsyReactContext } from './context'

export function PsyReactProvide(p: { children: React.ReactNode; deps?: PsyContextUpdater; parent?: PsyContext }) {
  const prevDeps = p.parent ?? React.useContext(PsyReactContext)
  const prevDepsRef = React.useRef(prevDeps)
  const nextDeps = p.deps === undefined ? prevDepsRef.current : prevDepsRef.current.clone(p.deps)
  prevDepsRef.current = nextDeps

  return <PsyReactContext.Provider value={nextDeps}>{p.children}</PsyReactContext.Provider>
}
