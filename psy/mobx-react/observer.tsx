import { observer as mobxObserver } from 'mobx-react-lite'
import React from 'react'
import { getRefreshable, throwHidden, normalizeError } from '@psy/core'

import { config, MobxPsyConfig } from './config'
import { mockState } from './mock'

type RefComponent<Ref, Props> = React.RefForwardingComponent<Ref, Props>

/**
 * Handles suspendable calculations in component.
 * Based on 'mobx-react-lite' observer.
 *
 * @example
 * ```tsx
 * const App = observer(function App() {
 *  return <ul>
 *    {
 *      store.todos.map(todo => <div>{todo.text}</div>) // throws Error or Promise
 *    }
 *   </ul>
 * })
 * ```
 */
export function observer<Props extends {}, Ref = {}>(
  baseComponent: RefComponent<Ref, Props>,
  options: MobxPsyConfig = config
) {
  if (options !== config) options = { ...config, ...options }

  const SafeComponent: RefComponent<Ref, Props> = (props, ref): React.ReactElement | null => {
    const node = React.useRef<React.ReactElement | null>(null)

    try {
      node.current = baseComponent(props, ref)

      if (mockState.called) return throwHidden(mockState.called)

      return node.current
    } catch (e) {
      const error = normalizeError(e)
      const refreshable = getRefreshable(error)

      if (error instanceof Error) {
        console.error(error)

        if (!options.error) return throwHidden(error)

        return <options.error refreshable={refreshable} error={error} children={node.current} />
      }

      if (!options.loading) return throwHidden(error)

      return <options.loading refreshable={refreshable} children={node.current} />
    } finally {
      mockState.called = null
    }
  }

  const value = (baseComponent.displayName ?? baseComponent.name ?? String(baseComponent)) + '#psy'
  Object.defineProperty(SafeComponent, 'name', { value })
  SafeComponent.displayName = value

  return mobxObserver(SafeComponent, options)
}
