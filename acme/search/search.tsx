import React from 'react'

import { PsyContextProvide } from '@psy/react/context/provide'
import { SnapRouterLocation } from '@snap/router/location'

import { AcmeSearchFlatList } from './flat/list'
import { AcmeSearchFlatListRoute } from './flat/ListRoute'

export function AcmeSearch({ id }: { id: string }) {
  return (
    <PsyContextProvide
      deps={$ => $.set(AcmeSearchFlatListRoute.instance, new AcmeSearchFlatListRoute($.get(SnapRouterLocation.instance)))}
    >
      <div id={id}>
        <h1 id={`${id}-title`}>Flats:</h1>
        <AcmeSearchFlatList id={`${id}-list`} />
      </div>
    </PsyContextProvide>
  )
}
