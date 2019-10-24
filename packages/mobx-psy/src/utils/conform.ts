export const conformHandlers: Map<any, Function> = new Map()

function arrayHandler<Target extends Array<any>, Source extends Array<any>>(target: Target, source: Source, stack: any[]) {
    let equal = target.length === source.length

    for(let i = 0; i < target.length; ++i) {
        const conformed = target[i] = conform(target[i], source[i], stack)
        if (equal && conformed !== source[i]) equal = false
    }

    return equal ? source : target
}

function objectHandler<Target extends Object>(target: Target, source: any, stack: any[]) {
    let count = 0
    let equal = true

    for (let key in target) {
        const conformed = target[key] = conform(target[key], source[key] as any, stack)
        if (equal && conformed !== source[key]) equal = false
        ++count
    }

    for (let key in source) if (--count < 0) break

    return (equal && count === 0) ? source : target
}

function dateHandler<Target extends Date, Source extends Date>(target: Target, source: Source) {
    return target.getTime() === source.getTime() ? source : target
}

function regExpHandler<Target extends Date, Source extends Date>(target: Target, source: Source) {
    return target.toString() === source.toString() ? source : target
}

conformHandlers.set(Array, arrayHandler)
conformHandlers.set(Object, objectHandler)
conformHandlers.set(Date, dateHandler)
conformHandlers.set(RegExp, regExpHandler)

const processed: WeakMap<Object, boolean> = new WeakMap()

export function conform<Target, Source>(
    target: Target,
    source: Source,
    stack: any[] = []
): Target {
    if (target === source as any) return (source as any)
    if (
        !target || typeof target !== 'object'
        || !source || typeof source !== 'object'
        || target instanceof Error
        || source instanceof Error
        || target.constructor !== source.constructor
        || processed.has(target)
    ) return target

    processed.set(target, true)
    const conformHandler = conformHandlers.get(target.constructor)

    if (!conformHandler) return target

    if (stack.indexOf(target) !== -1) return target
    stack.push(target)
    const res = conformHandler(target, source, stack)
    stack.pop()

    return res
}
