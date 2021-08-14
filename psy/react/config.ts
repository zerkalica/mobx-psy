import { observer as mobxObserver } from 'mobx-react-lite'

import { PsyReactFallbackError, PsyReactFallbackErrorProps, PsyReactFallbackLoading, PsyReactFallbackLoadingProps } from './Fallback'

export type PsyReactConfig = Parameters<typeof mobxObserver>[1] & {
  /**
   * Loading blend component on top of observed component (in children)
   */
  loading: React.FC<PsyReactFallbackLoadingProps>

  /**
   * Component to show error on top of observed component
   */
  error: React.FC<PsyReactFallbackErrorProps>
}

export const psyReactConfig: PsyReactConfig = {
  loading: PsyReactFallbackLoading,
  error: PsyReactFallbackError,
}

export function psyReactConfigSet(next: Partial<PsyReactConfig>) {
  Object.assign(psyReactConfig, next)
}
