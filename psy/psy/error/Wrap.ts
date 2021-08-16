export class PsyErrorWrap extends Error {
  constructor(message: string, readonly origin?: unknown) {
    super(message)
    if (!message && origin instanceof Error) this.message = origin.message
  }
}
