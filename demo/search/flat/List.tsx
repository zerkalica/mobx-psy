import { mock, observer } from 'mobx-psy'
import { DemoLibUiCheckBox, DemoLibUiNumberInput } from '@demo/lib-ui'
import React from 'react'

import { DemoSearchFlatDetails } from './Details'
import { DemoSearchFlatModelStore } from './model'

export const DemoSearchFlatList = observer(function DemoSearchFlatList({ id }: { id: string }) {
  const flats = DemoSearchFlatModelStore.use()
  // place hooks here
  const filter = flats.filter

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
      <button id={`${id}-refresh`} onClick={flats.refresh}>
        Refresh list
      </button>
      {mock({
        unsafe: () => (
          <ul id={`${id}-flats`}>
            {flats.filtered.map(flat => (
              <DemoSearchFlatDetails id={`${id}-flat[${flat.id}]`} key={flat.id} flat={flat} />
            ))}
          </ul>
        ),
        fallback: () => (
          <div id={`${id}-load`}>Load...</div>
        )
        })}
      Page {flats.page} of {flats.totalPages}
      <br />
      <button id={`${id}-more`} onClick={flats.more} disabled={flats.moreDisabled}>
        More
      </button>
      <button id={`${id}-prev`} onClick={flats.prev} disabled={flats.prevDisabled}>
        Prev
      </button>
      <button id={`${id}-next`} onClick={flats.next} disabled={flats.nextDisabled}>
        Next
      </button>
    </div>
  )
})
