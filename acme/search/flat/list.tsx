import React from 'react'

import { psySyncMock } from '@psy/core/sync/mock'
import { usePsyContextMemo } from '@psy/react/context/memo'
import { psySyncObserver } from '@psy/react/sync/observer'

import { AcmeSearchFlatDetails } from './details'
import { AcmeSearchFlatFilter } from './filter/filter'
import { AcmeSearchFlatModelStore } from './model'

export const AcmeSearchFlatList = psySyncObserver(function AcmeSearchFlatList({ id }: { id: string }) {
  const flats = usePsyContextMemo(AcmeSearchFlatModelStore, { id })

  return (
    <div id={id}>
      <AcmeSearchFlatFilter id={`${id}-filter`} refreshList={flats.refresh} />
      {psySyncMock({
        unsafe: () => (
          <ul id={`${id}-flats`}>
            {flats.filtered.map(flat => (
              <AcmeSearchFlatDetails id={`${id}-flat[${flat.dto.id}]`} key={flat.dto.id} flat={flat} />
            ))}
          </ul>
        ),
        fallback: () => <div id={`${id}-load`}>Load...</div>,
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
