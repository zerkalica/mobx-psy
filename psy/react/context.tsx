import React from 'react'

import { PsyContext } from '@psy/psy/context/Context'

export const PsyReactContext = React.createContext(PsyContext.instance)
PsyReactContext.displayName = 'PsyReactContext'

export function usePsyReactContext() {
  return React.useContext(PsyReactContext)
}
