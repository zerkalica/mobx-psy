import { proxify } from '../utils'

export function parallel<V extends {}>(v: () => V): V {
  try {
    return v()
  } catch (error) {
    return proxify(error)
  }
}
