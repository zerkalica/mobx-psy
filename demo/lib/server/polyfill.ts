import './envCheck'
import 'source-map-support/register'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
import { useStaticRendering } from 'mobx-react-lite'

useStaticRendering(true)
