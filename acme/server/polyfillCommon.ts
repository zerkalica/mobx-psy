import 'source-map-support/register'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import '@acme/browser/polyfillCommon'

import { enableStaticRendering } from 'mobx-react-lite'

enableStaticRendering(true)

Error.stackTraceLimit = 100
