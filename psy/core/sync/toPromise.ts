import { psyDataIsPromise } from '../data/isPromise'
import { psyErrorThrowHidden } from '../error/hidden'

export async function psySyncToPromise<V>(cb: () => V) {
  try {
    return cb()
  } catch (e) {
    if (psyDataIsPromise(e)) return e as Promise<V>
    psyErrorThrowHidden(e)
  }
}
