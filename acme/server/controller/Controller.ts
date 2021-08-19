import { PsyContext } from '@psy/psy/context/Context'
import { PsyLog } from '@psy/psy/log/log'

import { AcmeServerRequest } from '../request/Request'
import { AcmeServerResponse, AcmeServerResponseProps } from '../response/Response'

export class AcmeServerController {
  constructor(public $ = PsyContext.instance) {}

  req() {
    return new AcmeServerRequest()
  }

  res(props: AcmeServerResponseProps) {
    return new AcmeServerResponse(props)
  }

  async process() {
    return undefined as AcmeServerResponse | undefined | void
  }

  get log() {
    return this.$.get(PsyLog)
  }
}
