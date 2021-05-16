import { action, computed, makeObservable, reaction } from 'mobx'

import { PsyContext } from '@psy/core/context/Context'
import { psyObjectDraft } from '@psy/core/object/draft'
import { psySyncEffect } from '@psy/core/sync/effect'
import { SnapRouterLocation } from '@snap/router/location'

export const acmeSearchFlatFilterModelDefaults = {
  rooms: 0,
  house: false,
  city: '',
  nearestMetro: '',
}

export class AcmeSearchFlatFilterModel {
  constructor(protected $: PsyContext, protected location = $.get(SnapRouterLocation.instance)) {
    makeObservable(this)
    psySyncEffect(this, 'values', () => reaction(() => JSON.stringify(this.draft), this.submit, { delay: 300 }))
  }

  @computed protected get url() {
    return this.location.route(acmeSearchFlatFilterModelDefaults)
  }

  @computed get values() {
    return this.url.values
  }

  @computed protected get draft() {
    return psyObjectDraft(this.url.values)
  }

  @action.bound protected submit() {
    this.url.update(this.draft)
  }

  get urlChanged() {
    return this.url.changed
  }

  @action.bound resetUrl() {
    this.url.update()
  }

  get rooms() {
    return this.draft.rooms
  }

  @action.bound setRooms(next: number) {
    this.draft.rooms = next
  }

  get house() {
    return this.draft.house
  }

  get roomsVisible() {
    return true
  }

  @action.bound setHouse(next: boolean) {
    this.draft.house = next
  }

  get city() {
    return this.draft.city
  }

  @action.bound setCity(next: string) {
    this.draft.city = next
    this.setNearestMetro('')
  }

  get nearestMetro() {
    return this.draft.nearestMetro
  }

  @action.bound setNearestMetro(next: string) {
    this.draft.nearestMetro = next
  }
}
