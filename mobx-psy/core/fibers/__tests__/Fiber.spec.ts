import { FiberHostNotFound, Fiber } from '..'

describe('Fiber', () => {
  it('Running outside host - throws error', () => {
    expect(() => {
      const fiber = new Fiber('test', () => {})
    }).toThrowError(FiberHostNotFound)
  })
})
