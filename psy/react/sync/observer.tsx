import { observer as mobxObserver } from 'mobx-react-lite'
import React from 'react'

import { PsyContext } from '@psy/psy/context/Context'
import { psyDataIsPromise } from '@psy/psy/data/isPromise'
import { psyErrorThrowHidden } from '@psy/psy/error/hidden'
import { psyErrorNormalize } from '@psy/psy/error/normalize'
import { psyFunctionName } from '@psy/psy/function/name'
import { PsyLog } from '@psy/psy/log/log'
import { PsySsrHydrator } from '@psy/psy/ssr/Hydrator'
import { psySyncMockState } from '@psy/psy/sync/mock'
import { psySyncRefreshable } from '@psy/psy/sync/refreshable'

import { usePsyContext } from '../context/context'
import { psySyncConfig } from './config'

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
export function psySyncObserver<Props extends {}>(baseComponent: React.FunctionComponent<Props>, options = psySyncConfig) {
  if (options !== psySyncConfig) options = { ...psySyncConfig, ...options }

  const value = (baseComponent.displayName ?? baseComponent.name ?? String(baseComponent)) + '#psy'

  let result: React.FunctionComponent<Props>

  const SafeComponent = psyFunctionName((props: Props): React.ReactElement | null => {
    const node = React.useRef<React.ReactElement | null>(null)
    const $ = usePsyContext()
    const hydrator = $.get(PsySsrHydrator.instance)
    const old = PsyContext.instance
    PsyContext.instance = $

    try {
      node.current = baseComponent(props)

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

  result = mobxObserver<Props>(SafeComponent, options)

  return result
}
