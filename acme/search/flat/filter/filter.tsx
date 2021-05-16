import React from 'react'

import { SnapUiCheckBox } from '@snap/ui/checkbox'
import { SnapUiNumberInput } from '@snap/ui/numberInput'

import { AcmeSearchFlatFilterModel } from './model'

export function AcmeSearchFlatFilter({
  id,
  filter,
  refreshList,
}: {
  refreshList: () => void
  filter: AcmeSearchFlatFilterModel
  id: string
}) {
  return (
    <div id={id}>
      <label id={`${id}-label`}>
        Rooms:
        {filter.roomsVisible ? (
          <SnapUiNumberInput id={`${id}-rooms`} name="rooms" min={0} max={3} value={filter.rooms} onChange={filter.setRooms} />
        ) : null}
      </label>
      <label>
        <SnapUiCheckBox id={`${id}-house`} name="house" value={filter.house} onChange={filter.setHouse} />
        Only house
      </label>
      <button id={`${id}-reset`} disabled={!filter.urlChanged} onClick={filter.resetUrl}>
        Reset filters
      </button>
      <button id={`${id}-refreshList`} onClick={refreshList}>
        Refresh list
      </button>
    </div>
  )
}
