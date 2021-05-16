import { PsyContext } from '../context/Context'
import { PsyTrace } from '../trace/trace'

export type PsyLogObject = { place: Object | string; message?: Error | string }

export class PsyLog {
  static $ = PsyContext.instance

  protected static get trace() {
    return this.$.get(PsyTrace)
  }

  protected static logged = new WeakMap<Error, boolean>()

  static warn<V extends PsyLogObject>(p: V) {
    console.warn(`${p.place} [${this.trace.sessionId}]: ${p.message}`)
  }

  static error<V extends PsyLogObject>(p: V) {
    if (p.message instanceof Error) {
      if (this.logged.get(p.message)) return
      this.logged.set(p.message, true)
    }

    console.error(`${p.place} [${this.trace.sessionId}]: ${p.message}`)
  }
}
