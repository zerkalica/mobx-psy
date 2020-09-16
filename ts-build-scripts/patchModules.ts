import ModuleInternal from 'module'

type ResolvePart = {
  _resolveFilename(request: string, ...args: unknown[]): string
}

const Module: ResolvePart = module.constructor.length > 1
  ? (module.constructor as unknown as ResolvePart)
  : ModuleInternal as unknown as ResolvePart

const oldResolveFilename = Module._resolveFilename

export function patchModulesRegExpEscape(s: string): string {
  return s.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
}

export function patchModulesCreateReplace(prefixes: readonly string[]) {
  const requestRegEx = new RegExp(`^((?:${prefixes.map(patchModulesRegExpEscape).join('|')})\/[^\/]*)(\/.*)$`)
  const replacer = (_: string, p1: string, p2: string) => `${p1}/-${p2}`

  return (str: string) => str.replace(requestRegEx, replacer)
}

export function patchModules(replaceFn: (s: string) => string) {
  Module._resolveFilename = function _resolveFilename2(request, ...args) {
    return oldResolveFilename.call(this, replaceFn(request), ...args)
  }
}
