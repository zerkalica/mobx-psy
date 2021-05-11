export class PsyLog {
  static logged = new WeakMap<Error, boolean>()
  static error(p: { place: Object | string; error?: Error }) {
    if (p.error) {
      if (this.logged.get(p.error)) return
      this.logged.set(p.error, true)
    }
    console.error(p.error)
  }
}
