import { action, observable } from 'mobx'

import { FiberHost } from '../fibers'
import { defer, isPromise, throwHidden } from '../utils'
import { getDerivableName } from './getDerivableName'

type Task = () => void

export interface ActionsStatus {
  readonly processing: boolean
  readonly error: Error | undefined
}

export class Actions extends FiberHost implements ActionsStatus {
  protected tasks: Task[] = []

  /**
    PromiseLike if pending, undefined if complete, if Error error
  */
  @observable protected locked: Error | PromiseLike<any> | undefined = undefined

  constructor(id: string) {
    super(`${id}#${getDerivableName()}`)
  }

  run(task: Task): void {
    this.tasks.push(task)
    this.next()
  }

  get processing(): boolean {
    const { locked } = this
    return !!locked && !(locked instanceof Error)
  }

  get error(): Error | undefined {
    const { locked } = this
    return locked instanceof Error ? locked : undefined
  }

  protected scheduled = false

  next() {
    if (this.tasks.length === 0) return
    if (this.scheduled) return
    this.scheduled = true

    defer.add(this.invoke)
  }

  get initial() {
    return false
  }

  @action.bound protected invoke() {
    if (this.tasks.length === 0) return
    const task = this.tasks[0]
    const prev = FiberHost.current
    FiberHost.current = this
    try {
      task()
      this.tasks = this.tasks.slice(1)
      if (this.tasks.length === 0) this.locked = undefined
      this.scheduled = false
      this.clear()
      this.next()
    } catch (error) {
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
