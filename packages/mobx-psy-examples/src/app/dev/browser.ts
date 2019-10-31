import { createBrowserApp } from '../common/createBrowserApp'
import { createFetch } from '../common/mocks'
import { browserConfig } from './browserConfig'

const fetch = createFetch({
  errorRate: 0.9,
  timeout: 500,
})

createBrowserApp({ ...browserConfig, window, fetch})
