import { ParamsFromSchema } from './SchemaType'

export type RawParameter = string | string[]
export type PartialDefaults<Params, Defaults> = Omit<Params, keyof Defaults> & Partial<Defaults>
export type UnionOf<T> = T[keyof T]

export type Tokens<Params extends Record<string, any>> = {
    [P in keyof Params]: P
}

export type RawParamsType<Schema, Defaults> = PartialDefaults<
    Record<keyof ParamsFromSchema<Schema>, RawParameter>,
    Record<keyof Defaults, RawParameter>
>

export type RouteConfig<
    Schema = any,
    Data = any,
    Defaults = Partial<ParamsFromSchema<Schema>>,
    RawParams extends RawParamsType<Schema, Defaults> = RawParamsType<Schema, Defaults>
> = {
    readonly schema: Schema
    readonly defaults?: Defaults
    readonly data?: Data
    pattern(p: Tokens<ParamsFromSchema<Schema>>): string
    postMatch?: (p: RawParams, schema: Schema) => ParamsFromSchema<Schema>
    preBuild?: (p: ParamsFromSchema<Schema>, schema: Schema) => RawParams
}

export type AllRoutesConfig<K extends {} = any> = {
    [P in keyof K]: P extends string ? (K[P] extends RouteConfig ? K[P] : never) : never
}

export interface Route<
    Params = any,
    Data = any,
    Defaults extends Partial<Params> = Partial<Params>,
    Name extends string = string
> {
    readonly name: Name
    readonly params: Params

    push(params: PartialDefaults<Params, Defaults>): void
    replace(params: PartialDefaults<Params, Defaults>): void
    url(params: PartialDefaults<Params, Defaults>): string
}

export type RouteConfigToRoute<R extends RouteConfig, Name extends string> = R extends RouteConfig<
    infer Schema,
    infer Data,
    infer Defaults
>
    ? Route<ParamsFromSchema<Schema>, Data, Defaults, Name>
    : never

export type AllRoutes<K extends AllRoutesConfig<any>> = {
    [Name in keyof K]: Name extends string
        ? (K[Name] extends RouteConfig ? RouteConfigToRoute<K[Name], Name> : never)
        : never
}
