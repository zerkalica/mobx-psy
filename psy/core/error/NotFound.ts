import { PsyErrorWrap } from './Wrap'

export class PsyErrorNotFound extends PsyErrorWrap {
  constructor(message: string, origin?: Error, readonly httpCode = 404) {
    super(message, origin)
  }
}
