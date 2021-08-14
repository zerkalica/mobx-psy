import { psyReactObserver } from '@psy/react/observer'

import { AcmeSearchFlatModel } from './model'

export const AcmeSearchFlatDetails = psyReactObserver(function AcmeSearchFlatDetails({
  id,
  flat,
}: {
  id: string
  flat: AcmeSearchFlatModel
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
