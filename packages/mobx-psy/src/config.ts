import { observer as mobxObserver } from 'mobx-react-lite'
import {
  FallbackError,
  FallbackLoading,
  FallbackLoadingProps,
  FallbackErrorProps,
} from './mobx-react'

export type MobxPsyConfig = Parameters<typeof mobxObserver>[1] & {
  loading: React.FC<FallbackLoadingProps>
  error: React.FC<FallbackErrorProps>
}

export const config: MobxPsyConfig = {
  loading: FallbackLoading,
  error: FallbackError,
}

export function configure(next: Partial<MobxPsyConfig>) {
  Object.assign(config, next)
}
