import React from 'react'

import { psySyncObserver } from '@psy/react/sync/observer'

import { DemoSearchFlatModel } from './model'

export const DemoSearchFlatDetails = psySyncObserver(function DemoSearchFlatDetails({
  id,
  flat,
}: {
  id: string
  flat: DemoSearchFlatModel
}) {
  const dto = flat.dto

  return (
    <div id={id} style={{ padding: '0.5rem 0' }}>
      Id: {dto.id}
      <br />
      House: {dto.house ? 'yes' : 'no'}
      <br />
      Rooms: {dto.rooms}
    </div>
  )
})
