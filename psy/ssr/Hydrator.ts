import { isPromise } from '@psy/core/common'

const noop = () => {}

export abstract class Hydrator {
  static $$psy = true

  constructor(protected state: Record<string, any> = {}) {}

  get<V>(key: string): V | Promise<V> | Error | undefined {
    return this.state[key]
  }

  prepare<V>(key: string, v: Promise<V>) {}

  set<V>(key: string, v: V | Error | undefined) {
    throw new Error('use HydratorServer to fill state')
  }

  async collect() {
    const parts = await Promise.all(Object.values(this.state).filter(isPromise))

    return { state: this.state, loading: parts.length }
  }
}

export class HydratorServer extends Hydrator {
  prepare<V>(key: string, v: Promise<V>) {
    this.state[key] = v.catch(noop)
  }

  set<V>(key: string, v: V | Error | undefined) {
    this.state[key] = v
  }
}

export class HydratorBrowser extends Hydrator {
  protected handle: NodeJS.Timeout | undefined = undefined

  protected clear() {
    this.state = {}
  }

  get<V>(key: string): V | Promise<V> | Error | undefined {
    if (this.handle) clearTimeout(this.handle)
    this.handle = setTimeout(this.clear.bind(this), 500)

    return this.state[key]
  }
}
