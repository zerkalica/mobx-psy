import { action, makeObservable, observable } from 'mobx'

import { defer, isPromise, throwHidden, normalizeError, FiberHost } from '@psy/core'
import { getDerivableName } from './getDerivableName'

/**
 * Suspendable calculations.
 * 
 * @throws Error | PromiseLike<any>
 */
export type Task = () => void

/**
 * Taskman queue status
 * 
 * @example
 * ```ts
 * const queue = new Taskman('CommonPool')
 * queue.run(() => { some_fiberized_calculations })
 * mobx.autorun(() => {
 *   if (queue.processing) console.log(`Some tasks runnin in queue ${queue}`)
 *   if (queue.error) console.error(`Some task throws error ${queue.error} in queue ${queue}`)
 *   if (!queue.error && !queue.processing) console.log('Done, queue is empty')
 * })
 *
 * queue.run(() => {
 *   some suspendable calculations 1
 * })
 * queue.run(() => {
 *   some suspendable calculations 2
 * })
 * ```
 */
export interface TaskmanStatus {
  /**
   * True, if any task in queue is pending.
   * Mobx observable.
   */
  readonly processing: boolean

  /**
   * Error of first rejected task in action queue.
   * Mobx observable
   */
  readonly error: Error | undefined
}

/**
 * Sequently runs, restarts, caches and grabs status of tasks/actions with suspendable calculations.
 */
export class Taskman extends FiberHost implements TaskmanStatus {
  protected tasks: Task[] = []

  /**
   * Taskman queue status
   *
   * PromiseLike - pending
   * undefined - queue empty
   * Error - error
  */
  @observable protected locked: Error | PromiseLike<any> | undefined = undefined

  constructor(id: string) {
    super(`${id}#${getDerivableName()}`)
    makeObservable(this)
  }

  run(task: Task): void {
    this.tasks.push(task)
    this.next()
  }

  get processing(): boolean {
    const { locked } = this

    return !(locked instanceof Error) && locked !== undefined
  }

  get error(): Error | undefined {
    const { locked } = this

    return locked instanceof Error ? locked : undefined
  }

  /**
   * Flag to prevent scheduling next task if prev task already scheduled
   */
  protected scheduled = false

  /**
   * Schedule task to the next tick
   */
  next() {
    if (this.tasks.length === 0) return
    if (this.scheduled) return
    this.scheduled = true

    defer.add(this.invoke)
  }

  get isFirstRun() {
    // Always false in Taskman, see ../mobx-react/mock.ts
    return false
  }

  /**
   * Loop suspendable task queue
   */
  @action.bound protected invoke() {
    if (this.tasks.length === 0) return

    const task = this.tasks[0]
    const prev = FiberHost.current

    // Expose themself to task fibers
    FiberHost.current = this

    try {
      task()
      // Task complete - remove it from queue
      this.tasks = this.tasks.slice(1)

      // Clear error or pending state, if no more tasks
      if (this.tasks.length === 0) this.locked = undefined

      this.scheduled = false
      this.clear()
      this.next()
    } catch (e) {
      const error = normalizeError(e)
      this.locked = error

      if (!isPromise(error)) return throwHidden(error)

      error.then(this.invoke, this.invoke)
    } finally {
      FiberHost.current = prev
    }
  }

  destructor() {
    this.clear()
    this.tasks = []
    this.scheduled = false
  }
}
