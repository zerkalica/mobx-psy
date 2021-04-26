import React from 'react'

export class DemoLibUIContextBuilder {
  constructor(
    protected map = new Map<React.Provider<any>, {p: React.Provider<any>, v: any}>()
  ) {}

  clone() {
    return new DemoLibUIContextBuilder(new Map(this.map))
  }

  v<V>(p: React.Provider<V>, v: V): this {
    this.map.set(p, { p, v })

    return this
  }

  Provider = ({ children }: { children: React.ReactNode }) => this.component(children)

  require<V>(provider: React.Provider<V>): V {
    const item = this.map.get(provider);
    if (! item?.v) throw new Error('No context provided: ' + provider)

    return item.v
  }

  protected component(children: React.ReactNode, items = Array.from(this.map.values()).reverse(), index = 0) {
    const current = items.length > index ? items[index] : undefined
    if (! current) return <>{children}</>

    return <current.p value={current.v} children={this.component(children, items, index + 1)}/>
  }
}
