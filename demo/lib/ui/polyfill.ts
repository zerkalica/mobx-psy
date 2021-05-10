import { configure } from 'mobx'

import { psySyncConfigSet } from '@psy/react/sync/config'

import { DemoLibUiFallbackError } from './fallback/error'
import { DemoLibUiFallbackLoading } from './fallback/loading'

configure({
  enforceActions: 'observed',
})

psySyncConfigSet({
  loading: DemoLibUiFallbackLoading,
  error: DemoLibUiFallbackError,
})
