import { Loader } from './Loader'

let returnRaw: boolean | Loader<any> = false

function getLoader<V>(cb: () => V): Loader<V> {
  try {
    returnRaw = true as boolean | Loader<any>
    cb()

    if (returnRaw === false || returnRaw === true) {
      throw new Error(`Return @sync wrapped property in ${cb}`)
    }

    return returnRaw
  } finally {
    returnRaw = false
  }
}

function refresh(cb: () => any) {
  getLoader(cb).refresh()
}

/**
 * Decorator runs all suspendable calculations inside Loader.
 * Loader runs calculations, keep cache and collects loading/error status.
 *
 * Use 'parallel' helper to run fetchers in parallel.
 *
 * ```tsx
 * import { sync, observer, suspendify, effect } from 'mobx-psy'
 *
 * const fetchSync = suspendify((url, params) => fetch(baseUrl + url, params).then(r => r.json()))
 * 
 * class TodoStore {
 *   @sync get todos(): Todo[] {
 *     const todosCount = fetchSync('/todos/count')
 *     const todos = fetchSync('/todos')
 *
 *     return { todosCount, todos }
 *   }
 * }
 * ```
 */
export function sync<
  Host extends object,
  Field extends keyof Host,
  Value extends Host[Field]
>(
  proto: Host,
  name: Field,
  descr?: TypedPropertyDescriptor<Value>
): TypedPropertyDescriptor<Value> {
  if (!descr) descr = Object.getOwnPropertyDescriptor(proto, name)

  const store = new WeakMap<Host, Loader<Value>>()

  const descrGet = descr
    ? descr.get || (() => descr!.value!)
    : () => (undefined as unknown) as Value

  function get(this: Host) {
    let cache = store.get(this)

    if (!cache) {
      cache = new Loader<Value>(
        descrGet.bind(this),
        store.delete.bind(store, this)
      )
      store.set(this, cache)
    }

    if (returnRaw === true) returnRaw = cache

    return cache.value
  }

  return {
    enumerable: true,
    get,
  }
}

/**
 * Reset loader cache and refresh observer
 * 
 * @param cb callback with calculations with sync-decorated property
 *
 * @throws Error if not sync-decorated property used in callback
 *
 * ```tsx
 * import { action } from 'mobx'
 * 
 * class TodoStore {
 *   @sync get todos(): Todo[] {
 *     return fetchJson('/todos')
 *   }
 * 
 *   @action.bound refresh() {
 *     sync.refresh(() => this.todos)
 *   }
 * }
 */
sync.refresh = refresh
