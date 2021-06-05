import { action, computed, makeObservable } from 'mobx'

import { PsyContext } from '@psy/core/context/Context'
import { psySyncEffect } from '@psy/core/sync/effect'

import { AcmeSearchFlatListRoute } from '../ListRoute'

export class AcmeSearchFlatFilterModel {
  [Symbol.toStringTag] = 'AcmeSearchFlatFilterModel'
  constructor(protected $: PsyContext, protected route = $.get(AcmeSearchFlatListRoute.instance)) {
    makeObservable(this)
    psySyncEffect(this, 'values', () => this.values, this.submit, { delay: 300 })
  }

  @computed.struct get values() {
    return { ...this.route.paramsReq() }
  }

  @computed.struct get valuesDefault() {
    const { realty, regionId, deal } = this.values
    return { realty, regionId, deal }
  }

  @computed get changed() {
    return JSON.stringify(this.values) !== JSON.stringify(this.valuesDefault)
  }

  @action.bound reset() {
    this.route.push(this.valuesDefault)
  }

  @action.bound submit() {
    this.route.push(this.values)
  }

  get rooms() {
    return this.values.roomCount
  }

  @action.bound setRooms(next: number) {
    this.values.roomCount = next
  }

  get realty() {
    return this.values.realty
  }

  get roomsVisible() {
    return true
  }

  @action.bound setRealty(next = this.values.realty) {
    this.values.realty = next
  }

  get region() {
    return this.values.regionId
  }

  @action.bound setRegion(next: number) {
    this.values.regionId = next
  }
}
