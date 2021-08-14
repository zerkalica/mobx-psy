import React from 'react'

import { PsyContext } from '@psy/psy/context/Context'
import { psyDataCompareDeep } from '@psy/psy/data/compare'

import { usePsyContext } from './context'

/**
 * ```tsx
 * import React from 'react'
 * import { usePsyContextMemo } from '@psy/context'
 *
 * const Some = React.createContext('user')
 *
 * class User {
 *   constructor(
 *     protected $: PsyContext,
 *     protected options: { id: string },
 *     protected some = $.v(Some)
 *   ) {}
 *
 *   get name() { return this.some + this.id }
 * }
 *
 * function App(p: {id: string}) {
 *   const user = usePsyMemoClass(User, p.id)
 *   return <div>{user.name}</div>
 * }
 * ```
 */

export function usePsyContextMemo<Result, Args extends unknown[]>(
  cl: new (ctx: PsyContext, ...args: Args) => Result,
  ...args: Args
) {
  const ctx = usePsyContext()
  const memo = React.useRef<[Args, Result] | undefined>()
  if (memo.current === undefined || !psyDataCompareDeep(args, memo.current[0])) {
    const prev = PsyContext.instance
    try {
      PsyContext.instance = ctx
      memo.current = [args, new cl(ctx, ...args)]
    } finally {
      PsyContext.instance = prev
    }
  }

  return memo.current[1]
}
