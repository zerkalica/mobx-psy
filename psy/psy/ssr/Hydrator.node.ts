import { psyErrorNormalize } from '../error/normalize'
import { PsySsrHydrator } from './Hydrator'

export class PsySsrHydratorNode extends PsySsrHydrator {
  protected promises = {} as Record<string, Promise<unknown>>
  protected errors = {} as Record<string, Error>

  get<V>(key: string): V | Promise<unknown> | Error | undefined {
    return this.state[key] ?? this.promises[key] ?? this.errors[key]
  }

  prepare(key: string, v: Promise<unknown>) {
    this.promises[key] = v.catch(noop)
  }

  error(key: string, v: Error) {
    this.errors[key] = psyErrorNormalize(v)
  }

  protected renderErrors = new Set<Error>()
  renderError(error: Error) {
    this.renderErrors.add(error)
  }

  protected renderSuccessed = new Set<unknown>()
  renderSuccess(component: unknown) {
    this.renderSuccessed.add(component)
  }

  set<V>(key: string, v: V | undefined) {
    this.state[key] = v
  }

  async collect() {
    const promises = Object.values(this.promises)
    const parts = await Promise.all(promises)
    this.promises = {}

    const errors = Array.from(this.renderErrors)
    this.renderErrors.clear()

    const rendered = this.renderSuccessed.size

    this.renderSuccessed.clear()

    return { rendered, state: this.state, pending: parts.length, errors }
  }
}

const noop = () => {}
