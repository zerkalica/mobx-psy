import React from 'react'

import { AcmeRouterLocation } from '@acme/router/location'
import { PsyContextProvide } from '@psy/react/context/provide'

import { AcmeSearchFlatList } from './flat/list'
import { AcmeSearchFlatListRoute } from './flat/ListRoute'

export function AcmeSearch({ id }: { id: string }) {
  return (
    <PsyContextProvide
      deps={$ => $.set(AcmeSearchFlatListRoute.instance, new AcmeSearchFlatListRoute($.get(AcmeRouterLocation.instance)))}
    >
      <div id={id}>
        <h1 id={`${id}-title`}>Flats:</h1>
        <AcmeSearchFlatList id={`${id}-list`} />
      </div>
    </PsyContextProvide>
  )
}
