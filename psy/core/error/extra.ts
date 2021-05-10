import { PsyErrorMix } from './Mix'

export type PsyErrorExtra = {
  httpCode: number
}

const extras = new WeakMap<Error, PsyErrorExtra>()

export function psyErrorExtra(e: Error, extra?: PsyErrorExtra) {
  if (extra) {
    extras.set(e, extra)
    return extra
  }

  let lastExtra = extras.get(e)

  if (!(e instanceof PsyErrorMix)) return lastExtra

  for (const err of e.errors) {
    const errExtra = psyErrorExtra(err)
    if (errExtra && lastExtra && errExtra.httpCode > lastExtra.httpCode) lastExtra = errExtra
  }

  return lastExtra
}
