export class SnapRouterSegMap<Out> {
  constructor(protected segMap: Record<string, readonly Out[]>) {}

  regExp = Object.keys(this.segMap).join('|')

  param(s?: string) {
    if (s === undefined) return

    return this.segMap[s]
  }

  query(v?: readonly Out[] | Out) {
    if (v === undefined) return
    if (!(v instanceof Array)) v = [v]

    const segMap = this.segMap

    for (const key in segMap) {
      const item = segMap[key]
      let c = 0

      for (let i = 0; i < item.length; i++) {
        if (v.includes(item[i])) c++
      }

      if (c === item.length && c === v.length) return key
    }
  }
}
