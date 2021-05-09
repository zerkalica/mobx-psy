import { PsySsrHydrator } from './Hydrator'

export class PsySsrHydratorBrowser extends PsySsrHydrator {
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
