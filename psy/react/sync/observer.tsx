import { observer as mobxObserver } from 'mobx-react-lite'
import React from 'react'

import { PsyContext } from '@psy/core/context/Context'
import { psyErrorThrowHidden } from '@psy/core/error/hidden'
import { psyErrorNormalize } from '@psy/core/error/normalize'
import { PsyLog } from '@psy/core/log/log'
import { psySyncMockState } from '@psy/core/sync/mock'
import { psySyncRefreshable } from '@psy/core/sync/refreshable'

import { usePsyContext } from '../context/context'
import { psySyncConfig } from './config'

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
export function psySyncObserver<Props extends {}, Ref = {}>(baseComponent: RefComponent<Ref, Props>, options = psySyncConfig) {
  if (options !== psySyncConfig) options = { ...psySyncConfig, ...options }

  const value = (baseComponent.displayName ?? baseComponent.name ?? String(baseComponent)) + '#psy'

  const SafeComponent: RefComponent<Ref, Props> = (props, ref): React.ReactElement | null => {
    const node = React.useRef<React.ReactElement | null>(null)
    const $ = usePsyContext()
    const old = PsyContext.instance
    PsyContext.instance = $

    try {
      node.current = baseComponent(props, ref)

      if (psySyncMockState.called) return psyErrorThrowHidden(psySyncMockState.called)

      return node.current
    } catch (e) {
      const error = psyErrorNormalize(e)
      const refreshable = psySyncRefreshable(error)

      if (error instanceof Error) {
        const log = $.get(PsyLog)
        log.error({ place: value, error })

        if (!options.error) return psyErrorThrowHidden(error)

        return <options.error refreshable={refreshable} error={error} children={node.current} />
      }

      if (!options.loading) return psyErrorThrowHidden(error)

      return <options.loading refreshable={refreshable} children={node.current} />
    } finally {
      psySyncMockState.called = null
      PsyContext.instance = old
    }
  }

  Object.defineProperty(SafeComponent, 'name', { value })
  SafeComponent.displayName = value

  return mobxObserver(SafeComponent, options)
}
