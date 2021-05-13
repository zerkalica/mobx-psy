import { observer as mobxObserver } from 'mobx-react-lite'

import { PsySyncFallbackError, PsySyncFallbackErrorProps, PsySyncFallbackLoading, PsySyncFallbackLoadingProps } from './Fallback'

export type PsySyncConfig = Parameters<typeof mobxObserver>[1] & {
  /**
   * Loading blend component on top of observed component (in children)
   */
  loading: React.FC<PsySyncFallbackLoadingProps>

  /**
   * Component to show error on top of observed component
   */
  error: React.FC<PsySyncFallbackErrorProps>
}

export const psySyncConfig: PsySyncConfig = {
  loading: PsySyncFallbackLoading,
  error: PsySyncFallbackError,
}

export function psySyncConfigSet(next: Partial<PsySyncConfig>) {
  Object.assign(psySyncConfig, next)
}
