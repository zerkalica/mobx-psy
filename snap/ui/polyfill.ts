import { configure } from 'mobx'

import { psySyncConfigSet } from '@psy/react/sync/config'

import { SnapUiFallbackError } from './fallback/error'
import { SnapUiFallbackLoading } from './fallback/loading'

configure({
  enforceActions: 'observed',
})

psySyncConfigSet({
  loading: SnapUiFallbackLoading,
  error: SnapUiFallbackError,
})
