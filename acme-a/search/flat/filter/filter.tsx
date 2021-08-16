import { AcmeUiNumberInput } from '@acme/ui/numberInput'
import { usePsyReactContext } from '@psy/react/context'
import { psyReactObserver } from '@psy/react/observer'

import { AcmeSearchFlatListRoute } from '../ListRoute'
import { AcmeSearchFlatModelStore } from '../model'

export const AcmeSearchFlatFilter = psyReactObserver(function AcmeSearchFlatFilter(p: { id: string }) {
  const $ = usePsyReactContext()
  const route = $.get(AcmeSearchFlatListRoute.instance)
  const flats = $.get(AcmeSearchFlatModelStore.instance)

  return (
    <div id={p.id}>
      <label id={`${p.id}-label`}>
        Rooms:
        {route.get.roomCount ? (
          <AcmeUiNumberInput
            id={`${p.id}-rooms`}
            name="rooms"
            min={0}
            max={3}
            value={route.get.roomCount}
            onChange={route.set.roomCount}
          />
        ) : null}
      </label>
      {/* <label>
        <AcmeUiCheckBox id={`${id}-house`} name="house" value={route.get.realty} onChange={route.get.setRealty} />
        Only house
      </label> */}
      <button id={`${p.id}-reset`} disabled={!route.changed} onClick={route.reset}>
        Reset filters
      </button>
      <button id={`${p.id}-refreshList`} onClick={flats.refresh} disabled={flats.loading}>
        Refresh list
      </button>
    </div>
  )
})
