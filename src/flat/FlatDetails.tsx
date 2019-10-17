import React from 'react'
import { Flat } from './FlatDomain'

export function FlatDetails({ flat }: { flat: Flat }) {
  return (
    <div style={{ padding: '0.5rem 0' }}>
      Id: {flat.id}
      <br />
      House: {flat.house ? 'yes' : 'no'}
      <br />
      Rooms: {flat.rooms}
    </div>
  )
}
