import { DemoLibRouterLocation } from '@demo/lib-router/location'
import { psyContextCreate } from '@psy/context/create'
import { SyncFetch } from '@psy/core'

export const DemoLibIOContext = psyContextCreate<{
  location: DemoLibRouterLocation
  fetch: SyncFetch
}>('DemoLibIOContext')
