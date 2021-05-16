export class PsySsrHydrator {
  r = Math.random()
  constructor(protected state: Record<string, any> = {}) {}

  get<V>(key: string): V | Promise<unknown> | Error | undefined {
    return this.state[key]
  }

  prepare<V>(key: string, v: Promise<unknown>) {}

  set<V>(key: string, v: V) {}

  error(key: string, v: Error) {}

  renderError(error: Error) {}
  renderSuccess(component: unknown) {}

  remove(key: string) {
    this.state[key] = undefined
  }

  collect(): Promise<{ state: Record<string, any>; errors: readonly Error[]; pending: number; rendered: number }> {
    throw new Error('implement')
  }

  private static cache: PsySsrHydrator | undefined = undefined

  static get instance() {
    return this.cache ?? (this.cache = new PsySsrHydrator())
  }
}
