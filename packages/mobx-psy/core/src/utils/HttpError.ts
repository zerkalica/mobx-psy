export class HttpError extends Error {
  readonly name = HttpError.displayName

  constructor(readonly code: number, message = `Http ${code} error`) {
    super(message)
  }

  static displayName = 'HttpError'

  static is(obj: any): obj is HttpError {
    return obj && typeof obj === 'object' && (obj as { name: string }).name === this.displayName
  }
}
