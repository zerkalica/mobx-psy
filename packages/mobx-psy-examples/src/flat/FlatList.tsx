import React from 'react'
import { FlatDomain } from './FlatDomain'
import { FlatDetails } from './FlatDetails'
import { NumberInput, CheckBox } from '../ui'
import { observer, mock } from 'mobx-psy'

export const FlatList = observer(function FlatList() {
  const flats = FlatDomain.use()
  // place hooks here
  const filter = flats.filter

  return (
    <div>
      <label>
        Rooms:
        {filter.roomsVisible ? (
          <NumberInput
            name="rooms"
            min={0}
            max={3}
            value={filter.rooms}
            onChange={filter.setRooms}
          />
        ) : null}
      </label>
      <label>
        <CheckBox
          name="house"
          value={filter.house}
          onChange={filter.setHouse}
        />
        Only house
      </label>
      <button disabled={!filter.urlChanged} onClick={filter.resetUrl}>
        Reset filters
      </button>
      <button onClick={flats.refresh}>Refresh list</button>
      {mock(
        () => (
          <ul>
            {flats.filtered.map(flat => (
              <FlatDetails key={flat.id} flat={flat} />
            ))}
          </ul>
        ),
        () => (
          <div>Load...</div>
        )
      )}
      Page {flats.page} of {flats.totalPages}
      <br />
      <button onClick={flats.more} disabled={flats.moreDisabled}>
        More
      </button>
      <button onClick={flats.prev} disabled={flats.prevDisabled}>
        Prev
      </button>
      <button onClick={flats.next} disabled={flats.nextDisabled}>
        Next
      </button>
    </div>
  )
})
