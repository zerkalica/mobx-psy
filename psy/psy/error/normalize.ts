import { PsyErrorWrap } from './Wrap'

const wm = new WeakMap<Object, Error>()

/**
 * Convert non Error or PromiseLike to Error
 */
export function psyErrorNormalize(error: unknown | Error) {
  if (error instanceof Error) return error
  if (typeof error !== 'object') throw new Error(`Only object error allowed`)
  if (error === null) throw new Error(`Do not pass null as error`)

  // Weakmap used to keep instance of error with same input value
  let converted = wm.get(error)

  if (!converted) {
    converted = new PsyErrorWrap(JSON.stringify(error, null, ' '), error)
    wm.set(error, converted)
  }

  return converted
}
