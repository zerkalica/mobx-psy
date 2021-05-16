import { PsyErrorWrap } from './Wrap'

const wm = new WeakMap<Object, Error>()

/**
 * Convert non Error or PromiseLike to Error
 */
export function psyErrorNormalize(error: any) {
  if (error instanceof Error) return error

  // Weakmap used to keep instance of error with same input value
  let converted = wm.get(error)

  if (!converted) {
    converted = new PsyErrorWrap(JSON.stringify(error, null, ' '), error)
    wm.set(converted, error)
  }

  return converted
}
