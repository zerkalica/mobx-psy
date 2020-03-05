import React from 'react'

import { MyFetchContextValue, MyFetchProvider } from '@my/fetch'

import { MySearchFlatList } from './flat'

export function MySearch({
  id,
  fetch,
  location,
}: {
  id: string
} & MyFetchContextValue) {
  return (
    <MyFetchProvider
      value={{
        location,
        fetch,
      }}
    >
      <div id={id}>
        <h1 id={`${id}-title`}>Flats:</h1>
        <MySearchFlatList id={`${id}-list`} />
      </div>
    </MyFetchProvider>
  )
}
