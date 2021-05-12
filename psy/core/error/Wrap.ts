export class PsyErrorWrap extends Error {
  constructor(message?: string, readonly origin?: Error) {
    super(message ?? origin?.message ?? 'Unknown')
  }
}
