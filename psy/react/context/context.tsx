import React from 'react'

import { PsyContext } from '@psy/psy/context/Context'

export const PsyContextReact = React.createContext(PsyContext.instance)
PsyContextReact.displayName = 'PsyContextReact'

export function usePsyContext() {
  return React.useContext(PsyContextReact)
}
