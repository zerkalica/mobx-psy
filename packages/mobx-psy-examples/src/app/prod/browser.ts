import { FetchLike } from 'mobx-psy'

import { browserInit } from '../common/browserInit'

browserInit({ window, fetch: window.fetch as FetchLike })
