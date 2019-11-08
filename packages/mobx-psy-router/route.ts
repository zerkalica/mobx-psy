import { RouteConfig, AllRoutesConfig } from './RouteType'
import { ParamsFromSchema } from './SchemaType'

export function route<Schema, Data, Defaults extends Partial<ParamsFromSchema<Schema>>>(
    config: RouteConfig<Schema, Data, Defaults>
): RouteConfig<Schema, Data, Defaults> {
    return config
}

/**
 *
 * ```ts
 * const r = route.config({
 *    search: route({
 *        schema: {
 *            controller: schema.num,
 *            action: schema.num.opt,
 *            id: schema.str,
 *        },
 *        pattern: p => `/${p.action}/${p.id}/qwe`,
 *    }),
 *    offer: route({
 *        schema: {
 *            id: schema.str,
 *        },
 *        pattern: p => `/offer/${p.id}`,
 *    }),
 * })
 * ```
 **/
function config<K>(config: AllRoutesConfig<K>): AllRoutesConfig<K> {
    return config
}

route.config = config
