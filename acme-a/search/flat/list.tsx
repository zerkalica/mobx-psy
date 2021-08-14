import { psySyncMock } from '@psy/psy/sync/mock'
import { usePsyReactMemo } from '@psy/react/memo'
import { psyReactObserver } from '@psy/react/observer'
import { PsyReactProvide } from '@psy/react/provide'

import { AcmeSearchFlatDetails } from './details'
import { AcmeSearchFlatFilter } from './filter/filter'
import { AcmeSearchFlatModelStore } from './model'

export const AcmeSearchFlatList = psyReactObserver(function AcmeSearchFlatList({ id }: { id: string }) {
  const flats = usePsyReactMemo(AcmeSearchFlatModelStore, { id })

  return (
    <PsyReactProvide deps={ctx => ctx.set(AcmeSearchFlatModelStore.instance, flats)}>
      <div id={id}>
        <AcmeSearchFlatFilter id={`${id}-filter`} />
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
    </PsyReactProvide>
  )
})
