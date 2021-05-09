import React from 'react'

import { PsyContext } from '@psy/core/context/Context'

export const PsyContextReact = React.createContext(PsyContext.instance)
PsyContextReact.displayName = 'PsyReactContext'

export function usePsyContext() {
  return React.useContext(PsyContextReact)
}
