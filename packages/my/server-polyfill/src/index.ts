import 'source-map-support/register'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import './envCheck'
import { useStaticRendering } from 'mobx-react-lite'

useStaticRendering(true)
