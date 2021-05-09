import { observer as mobxObserver } from 'mobx-react-lite'
import React from 'react'

import { psyErrorThrowHidden } from '@psy/core/error/hidden'
import { psyErrorNormalize } from '@psy/core/error/normalize'
import { PsyLog } from '@psy/core/log/log'
import { psySyncMockState } from '@psy/core/sync/mock'
import { psySyncRefreshable } from '@psy/core/sync/refreshable'

import { psyReactConfig } from './config'
import { usePsyContext } from './context/context'

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
export function psyMobxReactObserver<Props extends {}, Ref = {}>(baseComponent: RefComponent<Ref, Props>, options = psyReactConfig) {
  if (options !== psyReactConfig) options = { ...psyReactConfig, ...options }

  const value = (baseComponent.displayName ?? baseComponent.name ?? String(baseComponent)) + '#psy'

  const SafeComponent: RefComponent<Ref, Props> = (props, ref): React.ReactElement | null => {
    const node = React.useRef<React.ReactElement | null>(null)
    const $ = usePsyContext()
    try {
      node.current = baseComponent(props, ref)

      if (psySyncMockState.called) return psyErrorThrowHidden(psySyncMockState.called)

      return node.current
    } catch (e) {
      const error = psyErrorNormalize(e)
      const refreshable = psySyncRefreshable(error)

      if (error instanceof Error) {
        const log = $.v(PsyLog)
        log.error({ place: value, error })

        if (!options.error) return psyErrorThrowHidden(error)

        return <options.error refreshable={refreshable} error={error} children={node.current} />
      }

      if (!options.loading) return psyErrorThrowHidden(error)

      return <options.loading refreshable={refreshable} children={node.current} />
    } finally {
      psySyncMockState.called = null
    }
  }

  Object.defineProperty(SafeComponent, 'name', { value })
  SafeComponent.displayName = value

  return mobxObserver(SafeComponent, options)
}
