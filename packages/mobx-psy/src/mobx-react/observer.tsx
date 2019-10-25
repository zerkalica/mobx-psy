import { observer as mobxObserver } from 'mobx-react-lite'
import React from 'react'

import { fallbackConfig, FallbackOptions } from './Fallback'
import { mockState } from './mock'
import { getRefreshable } from '../fibers'
import { throwHidden } from '../utils'

export type SafeObserverOptions = Parameters<typeof mobxObserver>[1] &
  Partial<FallbackOptions>

type RefComponent<Ref, Props> = React.RefForwardingComponent<Ref, Props>

export function observer<Props extends {}, Ref = {}>(
  baseComponent: RefComponent<Ref, Props>,
  options?: SafeObserverOptions
) {
  const FallbackError = (options ? options.error : null) || fallbackConfig.error
  const FallbackLoading =
    (options ? options.loading : null) || fallbackConfig.loading

  const safeComponent: RefComponent<Ref, Props> = (
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
      return (
        <FallbackLoading refreshable={refreshable} children={node.current} />
      )
    } finally {
      mockState.called = null
    }
  }

  const value = baseComponent.displayName || baseComponent.name
  Object.defineProperty(safeComponent, 'name', { value })
  safeComponent.displayName = value
  if (baseComponent.hasOwnProperty('propTypes'))
    safeComponent.propTypes = baseComponent.propTypes
  if (baseComponent.hasOwnProperty('contextTypes'))
    safeComponent.contextTypes = baseComponent.contextTypes
  if (baseComponent.hasOwnProperty('defaultProps'))
    safeComponent.defaultProps = baseComponent.defaultProps

  return mobxObserver(safeComponent, options)
}
