import { observer as mobxObserver } from 'mobx-react-lite'
import React from 'react'

import { mockState } from './mock'
import { getRefreshable } from '../fibers'
import { throwHidden } from '../utils'

import { config, MobxPsyConfig } from '../config'

type RefComponent<Ref, Props> = React.RefForwardingComponent<Ref, Props>

export function observer<Props extends {}, Ref = {}>(
  baseComponent: RefComponent<Ref, Props>,
  options: MobxPsyConfig = config
) {
  if (options !== config) options = { ...config, ...options }

  const SafeComponent: RefComponent<Ref, Props> = (
    props,
    ref
  ): React.ReactElement | null => {
    const node = React.useRef<React.ReactElement | null>(null)

    try {
      node.current = baseComponent(props, ref)
      if (mockState.called) return throwHidden(mockState.called)
      return node.current
    } catch (error) {
      const refreshable = getRefreshable(error)
      if (error instanceof Error) {
        console.error(error)
        if (!options.error) return throwHidden(error)
        return (
          <options.error
            refreshable={refreshable}
            error={error}
            children={node.current}
          />
        )
      }
      if (!options.loading) return throwHidden(error)
      return (
        <options.loading refreshable={refreshable} children={node.current} />
      )
    } finally {
      mockState.called = null
    }
  }
  const value = baseComponent.displayName || baseComponent.name
  Object.defineProperty(SafeComponent, 'name', { value })
  SafeComponent.displayName = value
  if (baseComponent.hasOwnProperty('propTypes'))
    SafeComponent.propTypes = baseComponent.propTypes
  if (baseComponent.hasOwnProperty('defaultProps'))
    SafeComponent.defaultProps = baseComponent.defaultProps

  return mobxObserver(SafeComponent, options)
}
