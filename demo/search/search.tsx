import React from 'react'

import { DemoSearchFlatList } from './flat/list'

export function DemoSearch({
  id,
}: {
  id: string
}) {
  return (
    <div id={id}>
      <h1 id={`${id}-title`}>Flats:</h1>
      <DemoSearchFlatList id={`${id}-list`} />
    </div>
  )
}
