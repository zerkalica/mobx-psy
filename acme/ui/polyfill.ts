import { configure } from 'mobx'

import { psySyncConfigSet } from '@psy/react/sync/config'

import { AcmeUiFallbackError } from './fallback/error'
import { AcmeUiFallbackLoading } from './fallback/loading'

configure({
  enforceActions: 'observed',
})

psySyncConfigSet({
  loading: AcmeUiFallbackLoading,
  error: AcmeUiFallbackError,
})
