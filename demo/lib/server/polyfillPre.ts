import './envCheck'
import 'source-map-support/register'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'

import { enableStaticRendering } from 'mobx-react-lite'

enableStaticRendering(true)
