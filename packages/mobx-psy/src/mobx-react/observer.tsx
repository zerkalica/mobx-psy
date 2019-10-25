import { observer as mobxObserver } from 'mobx-react-lite'
import React from 'react'

import {
  FallbackError,
  FallbackLoading,
  FallbackLoadingProps,
  FallbackErrorProps,
} from './Fallback'
import { mockState } from './mock'
import { getRefreshable } from '../fibers'
import { throwHidden } from '../utils'

export type SafeObserverOptions = Parameters<typeof mobxObserver>[1] & {
  loading?: React.FC<FallbackLoadingProps>
  error?: React.FC<FallbackErrorProps>
}

type RefComponent<Ref, Props> = React.RefForwardingComponent<Ref, Props>

export const observerDefaultOptions: SafeObserverOptions = {
  loading: FallbackLoading,
  error: FallbackError,
}

export function observer<Props extends {}, Ref = {}>(
  baseComponent: RefComponent<Ref, Props>,
  options: SafeObserverOptions = observerDefaultOptions
) {
  if (options !== observerDefaultOptions)
    options = { ...observerDefaultOptions, ...options }
  const FallbackError = options.error
  const FallbackLoading = options.loading

  const SafeComponentRaw: RefComponent<Ref, Props> = (
    props,
    ref
  ): React.ReactElement | null => {
    const node = React.useRef<React.ReactElement | null>(null)

    try {
      node.current = baseComponent(props, ref)
      if (mockState.called) throwHidden(mockState.called)
      return node.current
    } catch (error) {
      const refreshable = getRefreshable(error)
      if (error instanceof Error) {
        console.error(error)
        if (!FallbackError) return throwHidden(error)
        return (
          <FallbackError
            refreshable={refreshable}
            error={error}
            children={node.current}
          />
        )
      }
      if (!FallbackLoading) return throwHidden(error)
      return (
        <FallbackLoading refreshable={refreshable} children={node.current} />
      )
    } finally {
      mockState.called = null
    }
  }
  let SafeComponent = SafeComponentRaw
  if (!FallbackLoading) {
    SafeComponent = (props, ref) => (
      <React.Suspense fallback={null}>
        <SafeComponentRaw {...props} ref={ref} />
      </React.Suspense>
    )
  }

  const value = baseComponent.displayName || baseComponent.name
  Object.defineProperty(SafeComponent, 'name', { value })
  SafeComponent.displayName = value
  if (baseComponent.hasOwnProperty('propTypes'))
    SafeComponent.propTypes = baseComponent.propTypes
  if (baseComponent.hasOwnProperty('contextTypes'))
    SafeComponent.contextTypes = baseComponent.contextTypes
  if (baseComponent.hasOwnProperty('defaultProps'))
    SafeComponent.defaultProps = baseComponent.defaultProps

  return mobxObserver(SafeComponent, options)
}
