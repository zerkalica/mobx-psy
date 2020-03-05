import React from 'react'

import { MySearchFlatModel } from './model'

export function MySearchFlatDetails({ id, flat }: { id: string; flat: MySearchFlatModel }) {
  return (
    <div id={id} style={{ padding: '0.5rem 0' }}>
      Id: {flat.id}
      <br />
      House: {flat.house ? 'yes' : 'no'}
      <br />
      Rooms: {flat.rooms}
    </div>
  )
}
