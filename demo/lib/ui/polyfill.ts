import { configure } from 'mobx'

import { psyMobxReactConfigure } from '@psy/mobx-react/config'

import { DemoLibUiFallbackError } from './fallback/error'
import { DemoLibUiFallbackLoading } from './fallback/loading'

configure({
  enforceActions: 'observed',
})

psyMobxReactConfigure({
  loading: DemoLibUiFallbackLoading,
  error: DemoLibUiFallbackError,
})
