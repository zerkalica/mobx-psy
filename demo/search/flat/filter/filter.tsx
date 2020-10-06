import React from 'react'

import { DemoLibUiCheckBox } from '@demo/lib-ui/checkbox.js'
import { DemoLibUiNumberInput } from '@demo/lib-ui/numberInput.js'

import { DemoSearchFlatFilterModel } from './model'

export function DemoSearchFlatFilter({
  id,
  filter,
  refreshList,
}: {
  refreshList: () => void
  filter: DemoSearchFlatFilterModel
  id: string
}) {
  return (
    <div id={id}>
      <label id={`${id}-label`}>
        Rooms:
        {filter.roomsVisible ? (
          <DemoLibUiNumberInput
            id={`${id}-rooms`}
            name="rooms"
            min={0}
            max={3}
            value={filter.rooms}
            onChange={filter.setRooms}
          />
        ) : null}
      </label>
      <label>
        <DemoLibUiCheckBox id={`${id}-house`} name="house" value={filter.house} onChange={filter.setHouse} />
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
