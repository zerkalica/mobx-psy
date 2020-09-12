import { mock, observer } from 'mobx-psy'
import { MyUiCheckBox, MyUiNumberInput } from '@my/ui'
import React from 'react'

import { MySearchFlatDetails } from './Details'
import { MySearchFlatModelStore } from './model'

export const MySearchFlatList = observer(function MySearchFlatList({ id }: { id: string }) {
  const flats = MySearchFlatModelStore.use()
  // place hooks here
  const filter = flats.filter

  return (
    <div id={id}>
      <label id={`${id}-label`}>
        Rooms:
        {filter.roomsVisible ? (
          <MyUiNumberInput
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
        <MyUiCheckBox id={`${id}-house`} name="house" value={filter.house} onChange={filter.setHouse} />
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
              <MySearchFlatDetails id={`${id}-flat[${flat.id}]`} key={flat.id} flat={flat} />
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
