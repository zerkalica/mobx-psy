import React from 'react'

/**
 * ```tsx
 * import React from 'react'
 * 
 * const A = React.createContext(0)
 * const B = React.createContext(1)
 *
 * const AppContext = new PsyContextFlatten()
 *  .v(A, 1)
 *  .v(B, 2)
 *  .Provider
 * 
 * <AppContext><App/></AppContext>
 * ```
 */
export class PsyContextFlatten {
  constructor(
    protected map = new Map<React.Provider<any>, any>()
  ) {}

  clone() {
    return new PsyContextFlatten(new Map(this.map))
  }

  v<V>(p: React.Provider<V>, v: V): this {
    this.map.set(p, { p, v })

    return this
  }

  Provider = (p: { children: React.ReactNode }) => this.component(p.children)

  protected component(children: React.ReactNode, items = Array.from(this.map.values()).reverse(), index = 0) {
    const current = items.length > index ? items[index] : undefined
    if (! current) return <>{children}</>

    return <current.p value={current.v} children={this.component(children, items, index + 1)}/>
  }
}
