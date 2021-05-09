import { configure } from 'mobx'

import { psyMobxReactConfigSet } from '@psy/react/config'

import { DemoLibUiFallbackError } from './fallback/error'
import { DemoLibUiFallbackLoading } from './fallback/loading'

configure({
  enforceActions: 'observed',
})

psyMobxReactConfigSet({
  loading: DemoLibUiFallbackLoading,
  error: DemoLibUiFallbackError,
})
