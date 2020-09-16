import { onBecomeObserved, onBecomeUnobserved } from 'mobx'

/**
 * Sugar on top of mobx onBecomeObserved onBecomeUnobserved.
 * React.useEffect like.
 *
 * @example
 * ```ts
 * class Some {
 *   constructor() {
 *     effect(this, 'value', () => {
 *       // init some data on this.value become observed
 *       return () => this.destructor()
 *     })
 *   }
 *
 *   @computed get value() {}
 *
 *   destructor() {
 *     // called on value become unobserved
 *   }
 * }
 * ```
 */
export function effect<O extends {}, K extends keyof O>(
  target: O,
  property: K,
  ...effects: (() => () => void)[]
) {
  let disposers: (() => void)[] = []
  onBecomeObserved(target, property, () => {
    disposers = effects.map(effect => effect())
  })
  onBecomeUnobserved(target, property, () => {
    for (let disposer of disposers) disposer()
  })
}
