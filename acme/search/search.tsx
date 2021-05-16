import React from 'react'

import { AcmeSearchFlatList } from './flat/list'

export function AcmeSearch({ id }: { id: string }) {
  return (
    <div id={id}>
      <h1 id={`${id}-title`}>Flats:</h1>
      <AcmeSearchFlatList id={`${id}-list`} />
    </div>
  )
}
