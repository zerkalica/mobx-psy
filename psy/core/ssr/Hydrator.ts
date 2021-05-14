import { psyDataIsPromise } from '@psy/core/data/isPromise'

export class PsySsrHydrator {
  constructor(protected state: Record<string, any> = {}) {}

  get<V>(key: string): V | Promise<V> | Error | undefined {
    return this.state[key]
  }

  prepare<V>(key: string, v: Promise<V>) {}

  set<V>(key: string, v: V | Error) {
    throw new Error('use HydratorServer to fill state')
  }

  remove(key: string) {
    this.state[key] = undefined
  }

  async collect() {
    const parts = await Promise.all(Object.values(this.state).filter(psyDataIsPromise))

    return { state: this.state, loading: parts.length }
  }

  private static cache: PsySsrHydrator | undefined = undefined

  static get instance() {
    return this.cache ?? (this.cache = new PsySsrHydrator())
  }
}
