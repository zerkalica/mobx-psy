export function createContext<Context, Host extends {} = {}>(id: string, defaultValue?: Context | undefined) {
  const map = new WeakMap<Host, Context>()

  return {
    set(host: Host, value: Context) {
      map.set(host, value)
    },
    get(host: Host) {
      const value = map.get(host) ?? defaultValue

      if (!value) throw new Error(`Context not provided for ${id}, use ${id}.context.provide(req, data)`)

      return value
    },
  }
}
