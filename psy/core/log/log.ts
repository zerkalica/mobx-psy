export type PsyLogObject = { place: Object | string; message?: Error | string }

export class PsyLog {
  static context() {
    return {
      ua: '',
      url: '',
      rid: '',
      sid: '',
    }
  }

  protected static logged = new WeakSet<Error>()

  protected static isLogged(p: PsyLogObject) {
    if (p.message instanceof Error) {
      if (this.logged.has(p.message)) return true
      this.logged.add(p.message)
    }

    return false
  }

  protected static contextStr() {
    return JSON.stringify(this.context())
  }

  protected static format(p: PsyLogObject) {
    return p.message instanceof Error ? p.message.stack : p.message
  }

  static warn<V extends PsyLogObject>(p: V) {
    if (this.isLogged(p)) return
    console.warn(`${p.place} ${this.contextStr()}: ${this.format(p)}`)
  }

  static error<V extends PsyLogObject>(p: V) {
    if (this.isLogged(p)) return
    console.error(`${p.place} ${this.contextStr()}: ${this.format(p)}`)
  }
}
