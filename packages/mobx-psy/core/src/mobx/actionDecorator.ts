import { Actions, ActionsStatus } from './Actions'

let returnRaw: boolean | Actions = false

function getActions(cb: () => void): Actions {
  try {
    returnRaw = true as boolean | Actions
    cb()
    if (returnRaw === false || returnRaw === true)
      throw new Error(`Return @action wrapped property in ${cb}`)
    return returnRaw
  } finally {
    returnRaw = false
  }
}

function status(cb: () => void): ActionsStatus {
  return getActions(cb)
}

const defaultActionsKey = Symbol('Actions')

const store = new WeakMap<object, Map<symbol, Actions>>()

export function action<
  Host extends object,
  Field extends keyof Host,
  Args extends any[],
  Value extends Host[Field] & ((this: Host, ...args: Args) => void)
>(
  proto: Host,
  name: Field,
  descr?: TypedPropertyDescriptor<Value>,
  key: symbol = defaultActionsKey
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

    let actions = actionMap.get(key)

    if (!actions) {
      actions = new Actions(`${name}`)
      actionMap.set(key, actions)
    }
    if (returnRaw) returnRaw = actions
    else actions.run((value as Function).bind(this, ...args))
  }
  let defining = false
  function get(this: Host): Value {
    const binded = (runner as Function).bind(this)
    defining = true
    if (!defining)
      Object.defineProperty(this, name, {
        enumerable: false,
        get() {
          return binded
        },
      })
    defining = false
    return binded
  }

  return {
    enumerable: false,
    get,
  }
}
action.status = status
