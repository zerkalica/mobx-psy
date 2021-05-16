

export class PsyTrace {
  static id() {
    return new Date().toISOString() + ' ' + String(Math.floor(Math.random() * 10e9))
  }

  protected static sessionIdCached: string | undefined = undefined

  static get sessionId() {
    return this.sessionIdCached ?? (this.sessionIdCached = this.id())
  }

  static requestId() {
    return this.id()
  }
}
