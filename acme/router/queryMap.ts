export class AcmeRouterQueryMap<Out> {
  constructor(protected segMap: Record<string, Out>) {}

  param(s?: readonly string[]) {
    if (s === undefined) return

    const result: readonly Out[] = s.map(k => this.segMap[k])

    return result.length === 0 ? undefined : result
  }

  query(v?: readonly Out[] | Out) {
    const segMap = this.segMap
    if (v === undefined) return
    const result = [] as string[]
    if (!(v instanceof Array)) v = [v]

    for (let k in segMap) {
      for (let i = 0; i < v.length; i++) {
        if (segMap[k] === v[i]) result.push('' + v[i])
      }
    }

    return result.length === 0 ? undefined : result
  }
}
