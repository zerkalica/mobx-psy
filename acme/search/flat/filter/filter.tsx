import React from 'react'

import { usePsyContext } from '@psy/react/context/context'
import { SnapUiNumberInput } from '@snap/ui/numberInput'

import { AcmeSearchFlatListRoute } from '../ListRoute'

export function AcmeSearchFlatFilter(p: { refreshList?: () => void; id: string }) {
  const route = usePsyContext().get(AcmeSearchFlatListRoute.instance)

  return (
    <div id={p.id}>
      <label id={`${p.id}-label`}>
        Rooms:
        {route.get.roomCount ? (
          <SnapUiNumberInput
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
        <SnapUiCheckBox id={`${id}-house`} name="house" value={route.get.realty} onChange={route.get.setRealty} />
        Only house
      </label> */}
      <button id={`${p.id}-reset`} disabled={!route.changed} onClick={route.reset}>
        Reset filters
      </button>
      <button id={`${p.id}-refreshList`} onClick={p.refreshList}>
        Refresh list
      </button>
    </div>
  )
}
