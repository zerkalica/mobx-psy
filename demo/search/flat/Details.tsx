import React from 'react'

import { DemoSearchFlatModel } from './model'

export function DemoSearchFlatDetails({ id, flat }: { id: string; flat: DemoSearchFlatModel }) {
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
