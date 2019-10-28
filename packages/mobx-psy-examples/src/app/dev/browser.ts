import { browserInit } from '../common/browserInit'
import { createFetch } from '../common/mocks'

const fetch = createFetch({
  errorRate: 0.9,
  timeout: 500,
})

browserInit({ window, fetch })
