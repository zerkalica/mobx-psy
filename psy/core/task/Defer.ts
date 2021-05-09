type DeferCallback = () => void

const frame = typeof requestAnimationFrame === 'undefined' ? (cb: () => void) => Promise.resolve().then(cb) : requestAnimationFrame

/**
 * Simple scheduler.
 * Runs callbacks in series on each animation frame.
 */
class PsyTaskDefer {
  protected callbacks: DeferCallback[] = []
  protected scheduled = false

  add(cb: DeferCallback): this {
    this.callbacks.push(cb)

    if (this.scheduled) return this

    this.scheduled = true
    frame(this.rewind.bind(this))

    return this
  }

  rewind() {
    this.scheduled = false
    const callbacks = this.callbacks
    this.callbacks = []

    for (const cb of callbacks) {
      try {
        cb()
      } catch (error) {
        console.error(error)
      }
    }
  }
}

export const psyTaskDefer = new PsyTaskDefer()
