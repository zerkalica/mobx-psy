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

  async chain() {
    return undefined as AcmeServerResponse | undefined | void
  }

  async next() {}

  async run() {
    return (await this.chain()) ?? (await this.next())
  }

  get log() {
    return this.$.get(PsyLog)
  }
}
