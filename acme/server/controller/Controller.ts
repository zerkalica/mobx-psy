import { AcmeServerRequest } from '../request/Request'
import { AcmeServerResponse } from '../response/Response'

export class AcmeServerController {
  req() {
    return new AcmeServerRequest()
  }

  res() {
    return new AcmeServerResponse()
  }

  async process() {
    return new AcmeServerResponse() as AcmeServerResponse | undefined
  }
}
