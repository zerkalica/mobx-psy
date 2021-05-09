import { observer as mobxObserver } from 'mobx-react-lite'

import { FallbackError, FallbackErrorProps, FallbackLoading, FallbackLoadingProps } from './Fallback'

type PsyReactConfig = Parameters<typeof mobxObserver>[1] & {
  /**
   * Loading blend component on top of observed component (in children)
   */
  loading: React.FC<FallbackLoadingProps>

  /**
   * Component to show error on top of observed component
   */
  error: React.FC<FallbackErrorProps>
}

export const psyReactConfig: PsyReactConfig = {
  loading: FallbackLoading,
  error: FallbackError,
}

export function psyMobxReactConfigSet(next: Partial<PsyReactConfig>) {
  Object.assign(psyReactConfig, next)
}
