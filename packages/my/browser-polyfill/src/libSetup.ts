import { configure } from 'mobx'
import { configurePsy } from 'mobx-psy'

import { MyUiFallbackError, MyUiFallbackLoading } from '@my/ui'

configure({
  enforceActions: 'observed',
})

configurePsy({
  loading: MyUiFallbackLoading,
  error: MyUiFallbackError,
})
