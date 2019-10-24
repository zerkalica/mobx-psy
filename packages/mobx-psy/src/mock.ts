import { getResponse } from './Loader'
import { throwHidden } from './utils'

export const mockState: {
  called: Promise<any> | null
} = {
  called: null,
}

export function mock<State, Fallback>(
  unsafe: () => State,
  fallback: () => Fallback
): State | Fallback {
  try {
    return unsafe()
  } catch (error) {
    const response = getResponse(error)
    if (error instanceof Error || !response || !response.initial)
      return throwHidden(error)
    const result = fallback()
    mockState.called = error
    return result
  }
}
