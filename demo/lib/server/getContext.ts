const contextKey = Symbol('context')

export function demoLibServerGetContext<Context>(obj: Object): Context {
  const context = obj ? (obj as any)[contextKey] as Context : undefined

  if (! context) throw new Error('Use setContext(req, context)')

  return context
}

export function demoLibServerSetContext<Context>(obj: Object, context: Context) {
  (obj as any)[contextKey] = context
}
