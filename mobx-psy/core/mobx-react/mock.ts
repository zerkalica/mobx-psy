import { getRefreshable } from '../fibers'
import { throwHidden, normalizeError } from '../utils'

/**
 * Used internally in observer
 */
export const mockState: {
  /**
   * Promise or error passed from mock to observer to show loading/error component
   */
  called: PromiseLike<any> | null
} = {
  called: null,
}

interface MockParams<State, Fallback> {
  /**
   * Returns fallback data, called when main data is loading
   */
  fallback: () => Fallback

  /**
   * Returns main data
   * 
   * @throws Error | PromiseLike<any>
   */
  unsafe: () => State
}

/**
 * On first run returns fallback data, while main data is loading.
 * On second run just blocks inputs and show loader blend on top of last actual rendered component.
 * Usefull for skeleton screens, https://www.lukew.com/ff/entry.asp?1797
 *
 * @example
 * ```tsx
 * const App = observer(function App() {
 *  return <ul>
 *    {mock({
 *      fallback: () => <div>Fake todos</div>,
 *      unsafe: () => store.todos.map(todo => <div>{todo.text}</div>),
 *    })}
 *   </ul>
 * })
 * ```
 */
export function mock<State, Fallback>(p: MockParams<State, Fallback>): State | Fallback {
  try {
    return p.unsafe()
  } catch (e) {
    const error = normalizeError(e)

    // throw, if any error or fiber, associated with promise, is completed
    // Call fallback on fist calculations, if calculations was completed and refreshed - throws promise.
    // observer catches promise and returns last actual rendered component with loading blend.
    if (error instanceof Error || ! getRefreshable(error)?.isFirstRun) return throwHidden(error)

    const result = p.fallback()

    // save promise or error and pass it to observer to suspend component or to show error component
    mockState.called = error

    return result
  }
}
