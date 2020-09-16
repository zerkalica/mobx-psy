import { observer as mobxObserver } from 'mobx-react-lite'
import { FallbackError, FallbackLoading, FallbackErrorProps, FallbackLoadingProps } from './Fallback'

export type MobxPsyConfig = Parameters<typeof mobxObserver>[1] & {
  /**
   * Loading blend component on top of observed component (in children)
   */
  loading: React.FC<FallbackLoadingProps>

  /**
   * Component to show error on top of observed component
   */
  error: React.FC<FallbackErrorProps>
}

export const config: MobxPsyConfig = {
  loading: FallbackLoading,
  error: FallbackError,
}

export function configurePsy(next: Partial<MobxPsyConfig>) {
  Object.assign(config, next)
}
