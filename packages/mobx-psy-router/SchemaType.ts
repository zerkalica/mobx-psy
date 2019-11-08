export const schema = {
    num: { v: 'num', t: 'req', opt: { v: 'num', t: 'opt' } },
    str: { v: 'str', t: 'req', opt: { v: 'str', t: 'opt' } },
    bool: { v: 'bool', t: 'req', opt: { v: 'bool', t: 'opt' } },
} as const

type KindToType<Kind> = Kind extends Pick<typeof schema.num, 'v'>
    ? number
    : Kind extends Pick<typeof schema.str, 'v'>
    ? string
    : Kind extends Pick<typeof schema.bool, 'v'>
    ? boolean
    : never

type OptionalKeys<T> = {
    [P in keyof T]: T[P] extends Pick<typeof schema.num.opt, 't'> ? P : never
}[keyof T]

type RequiredKeys<T> = {
    [P in keyof T]: T[P] extends Pick<typeof schema.num, 't'> ? P : never
}[keyof T]

type SchemaTypeRaw<Schema> = {
    [P in keyof Schema]: KindToType<Schema[P]>
}

export type ParamsFromSchema<Schema> = Partial<
    SchemaTypeRaw<Pick<Schema, OptionalKeys<Schema>>>
> &
    SchemaTypeRaw<Pick<Schema, RequiredKeys<Schema>>>
