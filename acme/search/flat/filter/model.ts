import { action, computed, makeObservable } from 'mobx'

import { PsyContext } from '@psy/core/context/Context'
import { psySyncEffect } from '@psy/core/sync/effect'

import { AcmeSearchFlatListRoute } from '../ListRoute'

export const acmeSearchFlatFilterModelDefaults = {
  rooms: 0,
  house: false,
  region: '',
  nearestMetro: '',
}

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

  @action.bound protected reset() {
    this.route.push(this.valuesDefault)
  }

  @action.bound protected submit() {
    this.route.push(this.values)
  }

  get rooms() {
    return this.values.rooms
  }

  @action.bound setRooms(next: number) {
    this.values.rooms = next
  }

  get realty() {
    return this.values.realty
  }

  get roomsVisible() {
    return true
  }

  @action.bound setRealty(next: boolean) {
    this.values.realty = next
  }

  get region() {
    return this.values.regionId
  }

  @action.bound setCity(next: number) {
    this.values.regionId = next
    this.setNearestMetro('')
  }

  get nearestMetro() {
    return this.values.nearestMetro
  }

  @action.bound setNearestMetro(next: string) {
    this.values.nearestMetro = next
  }
}
