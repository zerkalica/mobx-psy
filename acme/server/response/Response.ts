import { AcmeServerRequestContentType } from '../request/Request'

export class AcmeServerResponse {
  statusCode() {
    return 200
  }

  contentType(): AcmeServerRequestContentType {
    return 'text/html'
  }

  buffer() {
    return undefined as string | Buffer | NodeJS.ReadableStream | undefined
  }
}
