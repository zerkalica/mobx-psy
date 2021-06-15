import { action, makeObservable } from 'mobx'

import { PsyContext } from '../context/Context'
import { PsyFetcherProps } from '../fetcher/Fetcher'
import { PsySyncLoader } from './Loader'

export abstract class PsySyncModel {
  constructor(protected $: PsyContext) {
    makeObservable(this)
  }

  protected syncLoader = new PsySyncLoader(this.$, this.args.bind(this))

  abstract args(): PsyFetcherProps

  get data() {
    return this.syncLoader.data
  }

  @action.bound refresh() {
    this.syncLoader.refresh()
  }

  get initial() {
    return this.syncLoader.initial
  }

  get loading() {
    return this.syncLoader.loading
  }

  get error() {
    return this.syncLoader.error
  }
}
