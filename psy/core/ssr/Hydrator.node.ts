import { PsySsrHydrator } from './Hydrator'

export class PsySsrHydratorNode extends PsySsrHydrator {
  prepare<V>(key: string, v: Promise<V>) {
    this.state[key] = v.catch(noop)
  }

  set<V>(key: string, v: V | Error | undefined) {
    this.state[key] = v
  }
}

const noop = () => {}
