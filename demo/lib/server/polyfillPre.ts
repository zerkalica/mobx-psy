import './envCheck'
import 'source-map-support/register'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'

import { useStaticRendering } from 'mobx-react-lite'
import { patchModules, patchModulesCreateReplace } from '@psy/boot'

useStaticRendering(true)

patchModules(patchModulesCreateReplace([ '@demo', '@psy' ]))
