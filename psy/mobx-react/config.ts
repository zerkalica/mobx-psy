import { observer as mobxObserver } from 'mobx-react-lite'

import { FallbackError, FallbackErrorProps, FallbackLoading, FallbackLoadingProps } from './Fallback'

export type PsyMobxReactConfig = Parameters<typeof mobxObserver>[1] & {
  /**
   * Loading blend component on top of observed component (in children)
   */
  loading: React.FC<FallbackLoadingProps>

  /**
   * Component to show error on top of observed component
   */
  error: React.FC<FallbackErrorProps>
}

export const psyMobxReactConfig: PsyMobxReactConfig = {
  loading: FallbackLoading,
  error: FallbackError,
}

export function psyMobxReactConfigure(next: Partial<PsyMobxReactConfig>) {
  Object.assign(psyMobxReactConfig, next)
}
