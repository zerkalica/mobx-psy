import { FetchLike } from 'mobx-psy'

import { createBrowserApp } from '../common/createBrowserApp'

import { browserConfig } from './browserConfig'

createBrowserApp({ ...browserConfig, window, fetch: window.fetch as FetchLike })
