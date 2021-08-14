import { onBecomeObserved, onBecomeUnobserved, reaction } from 'mobx'

import { psyFunctionName } from '../function/name'

/**
 * Autodisposable reaction
 *
 * @example
 * ```ts
 * class Some {
 *   constructor() {
 *     psySyncEffect(this, 'values', () => this.url, this.submit, { delay: 300 })
 *   }
 *
 *   @computed.struct get url() { return location.pathname + location.search }
 *
 *   @computed.struct get values() {
 *     // output values
 *   }
 *
 *   submit() {
 *     // called if url changed
 *   }
 * }
 * ```
 */
export function psySyncEffect<O extends {}>(
  o: O & { [Symbol.toStringTag]?: string },
  k: keyof O,
  ...args: Parameters<typeof reaction>
) {
  let disposer: ReturnType<typeof reaction> | undefined
  onBecomeObserved(
    o,
    k,
    psyFunctionName(() => {
      disposer = reaction(...args)
    }, (o[Symbol.toStringTag] ?? 'psySyncEffect') + 'onBecomeObserved')
  )
  onBecomeUnobserved(
    o,
    k,
    psyFunctionName(() => disposer?.(), (o[Symbol.toStringTag] ?? 'psySyncEffect') + 'onBecomeUnObserved')
  )
}
