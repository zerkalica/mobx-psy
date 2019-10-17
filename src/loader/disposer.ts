import { onBecomeObserved, onBecomeUnobserved } from 'mobx'

export function disposer<O extends {}, K extends keyof O>(
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
