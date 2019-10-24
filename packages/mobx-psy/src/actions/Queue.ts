import { FiberHost } from '../fibers'
import { Fiber } from '../fibers'
import { defer, throwHidden } from '../utils'
import { action, observable } from 'mobx'
import { isPromise } from 'q'

type Task = () => void

export class Queue {
  protected tasks: Task[] = []

  /**
        PromiseLike if pending, undefined if complete, if Error error
     */
  @observable protected locked: Error | PromiseLike<any> | undefined = undefined

  protected host: FiberHost | undefined = undefined

  run(task: Task): void {
    this.tasks.push(task)
    this.refresh()
  }

  get pending(): boolean {
    const { locked } = this
    return !!locked && !(locked instanceof Error)
  }

  get error(): Error | undefined {
    const { locked } = this
    return locked instanceof Error ? locked : undefined
  }

  get complete(): boolean {
    return !this.locked
  }

  protected scheduled = false

  @action.bound refresh() {
    if (this.tasks.length === 0) return
    if (this.scheduled) return
    this.scheduled = true

    defer.add(this.processing)
  }

  @action.bound protected processing() {
    if (this.tasks.length === 0) return
    const task = this.tasks[0]
    const prev = Fiber.host
    if (!this.host) this.host = new FiberHost(this)
    Fiber.host = this.host
    try {
      task()
      this.tasks = this.tasks.slice(1)
      if (this.tasks.length === 0) this.locked = undefined
      this.scheduled = false
      this.host.destructor()
      this.host = undefined
      this.refresh()
    } catch (error) {
      this.locked = error
      if (!isPromise(error)) return throwHidden(error)
      error.then(this.processing, this.processing)
    } finally {
      Fiber.host = prev
    }
  }

  destructor() {
    if (this.host) this.host.destructor()
    this.host = undefined
    this.tasks = []
    this.scheduled = false
  }
}
