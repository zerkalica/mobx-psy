import { configure } from 'mobx'

import { AcmeUiFallbackError } from '@acme/ui/fallback/error'
import { AcmeUiFallbackLoading } from '@acme/ui/fallback/loading'
import { psyReactConfigSet } from '@psy/react/config'

configure({
  enforceActions: 'observed',
})

psyReactConfigSet({
  loading: AcmeUiFallbackLoading,
  error: AcmeUiFallbackError,
})
