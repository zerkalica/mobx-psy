import { observer as mobxObserver } from 'mobx-react-lite'
import React from 'react'

import { PsyContext } from '@psy/core/context/Context'
import { psyDataIsPromise } from '@psy/core/data/isPromise'
import { psyErrorThrowHidden } from '@psy/core/error/hidden'
import { psyErrorNormalize } from '@psy/core/error/normalize'
import { psyFunctionName } from '@psy/core/function/name'
import { PsyLog } from '@psy/core/log/log'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'
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

  let result: ReturnType<typeof mobxObserver>

  const SafeComponent: RefComponent<Ref, Props> = psyFunctionName((props, ref): React.ReactElement | null => {
    const node = React.useRef<React.ReactElement | null>(null)
    const $ = usePsyContext()
    const hydrator = $.get(PsySsrHydrator.instance)
    const old = PsyContext.instance
    PsyContext.instance = $

    try {
      node.current = baseComponent(props, ref)

      if (psySyncMockState.called) return psyErrorThrowHidden(psySyncMockState.called)
      hydrator.renderSuccess(result)
      return node.current
    } catch (e) {
      const error = psyDataIsPromise(e) ? e : psyErrorNormalize(e)
      const refreshable = psySyncRefreshable(error)

      if (error instanceof Error) {
        hydrator.renderError(error)

        const log = $.get(PsyLog)
        log.error({ place: value, message: error })

        if (!options.error) return psyErrorThrowHidden(error)

        return <options.error refreshable={refreshable} error={error} children={node.current} />
      }

      if (!options.loading) return psyErrorThrowHidden(error)

      return <options.loading refreshable={refreshable} children={node.current} />
    } finally {
      psySyncMockState.called = null
      PsyContext.instance = old
    }
  }, value)

  result = mobxObserver(SafeComponent, options)

  return result
}
