import React from 'react'

import { DemoLibFetchProps, DemoLibFetchProvider } from '@demo/lib-fetch'

import { DemoSearchFlatList } from './flat/list'

export function DemoSearch({
  id,
  fetch,
  location,
}: {
  id: string
} & DemoLibFetchProps) {
  return (
    <DemoLibFetchProvider
      value={{
        location,
        fetch,
      }}
    >
      <div id={id}>
        <h1 id={`${id}-title`}>Flats:</h1>
        <DemoSearchFlatList id={`${id}-list`} />
      </div>
    </DemoLibFetchProvider>
  )
}
