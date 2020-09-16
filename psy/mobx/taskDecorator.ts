import { Taskman, TaskmanStatus } from './Taskman'

let returnRaw: boolean | Taskman = false

function getTaskman(cb: (...args: any[]) => any): Taskman {
  try {
    returnRaw = true as boolean | Taskman
    cb()

    if (returnRaw === false || returnRaw === true) {
      throw new Error(`Return @action wrapped property in ${cb}`)
    }

    return returnRaw
  } finally {
    returnRaw = false
  }
}

function status(cb: (...args: any[]) => any): TaskmanStatus {
  return getTaskman(cb)
}

const defaultTaskmanKey = Symbol('CommonPool')

const store = new WeakMap<object, Map<symbol, Taskman>>()

/**
 * Restartable idempotent action decorator.
 * Context is binded.
 *
 * ```ts
 * import { task } from '@psy/mobx'
 *
 * class User {
 *   @task save(some: number) {
 *   }
 * }
 * const user = new User
 * user.save(1)
 * user.save(2)
 * mobx.autorun(() => {
 *   task.status(user.save).processing
 * })
 * ```
 */
export function task<
  Host extends object,
  Field extends keyof Host,
  Args extends any[],
  Value extends Host[Field] & ((this: Host, ...args: Args) => void)
>(
  proto: Host,
  name: Field,
  descr?: TypedPropertyDescriptor<Value>,
  key: symbol = defaultTaskmanKey
): TypedPropertyDescriptor<Value> {
  if (!descr) descr = Object.getOwnPropertyDescriptor(proto, name)

  if (!descr) throw new Error(`descr is empty in ${proto}.${name}`)

  const value = descr.value!

  function runner(this: Host, ...args: Args): void {
    let actionMap = store.get(this)

    if (!actionMap) {
      actionMap = new Map()
      store.set(this, actionMap)
    }

    let taskman = actionMap.get(key)

    if (!taskman) {
      taskman = new Taskman(`${name}`)
      actionMap.set(key, taskman)
    }

    if (returnRaw) {
      returnRaw = taskman
    } else {
      taskman.run((value as Function).bind(this, ...args))
    }
  }

  let defining = false

  function get(this: Host): Value {
    const binded = (runner as Function).bind(this)
    defining = true

    if (!defining) {
      Object.defineProperty(this, name, {
        enumerable: false,
        get() {
          return binded
        },
      })
    }

    defining = false

    return binded
  }

  return {
    enumerable: false,
    get,
  }
}

/**
 * Get observable action status from action-decorated method
 * 
 * @throw Error if no action method passed in callback
 *
 * ```ts
 * import { action } from '@psy/mobx'
 *
 * class User {
 *   @action save(some: number) {
 *   }
 *
 *   isSaving {
 *     return action.status(this.save).processing
 *   }
 *
 *   savingError() {
 *     return action.status(this.save).error
 *   }
 * }
 * ```
 */
task.status = status
