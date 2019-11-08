/// <reference path="./susanin.d.ts" />
import Susanin, { Route as SusaninRouteRaw, SusaninRouteConfig } from 'susanin'

import { PageNotFoundError, Router } from '../Router'
import {
    AllRoutes,
    AllRoutesConfig,
    Route,
    RouteConfig,
    UnionOf,
} from '../RouteType'
import { ParamsFromSchema, schema } from '../SchemaType'
import { RouteSusanin } from './RouteSusanin'
import { route } from '../route'

const tokenGenerator = new Proxy({} as Record<string, any>, {
    get(target: any, key: string) {
        return `<${key}>`
    },
})

export class RouterSusanin<C extends AllRoutesConfig> extends Router<C> {
    protected susanin = new Susanin()
    protected facades = new WeakMap<SusaninRouteRaw, Route>()

    protected createRoute<
        Schema,
        Data,
        Params = ParamsFromSchema<Schema>,
        Defaults = Partial<Params>,
        Name extends string = string
    >(
        {
            data,
            defaults,
            pattern,
            postMatch,
            preBuild,
            schema,
        }: RouteConfig<Schema, Data, Defaults>,
        name: Name
    ): Route<Params, Data, Defaults, Name> {
        const susaninRouteConfig: SusaninRouteConfig<Params, Data, Defaults, Name> = {
            postMatch: postMatch ? postMatch.bind(null, schema) : undefined,
            preBuild: postMatch ? preBuild.bind(null, schema) : undefined,
            data,
            defaults,
            pattern: pattern(tokenGenerator),
            name,
        }

        const rawRoute = this.susanin.addRoute(susaninRouteConfig)

        const facade = new RouteSusanin(rawRoute, this)
        this.facades.set(rawRoute, facade)
        return facade
    }

    get current(): UnionOf<AllRoutes<C>> {
        const rec = this.susanin.findFirst(this.currentUrl)
        if (!rec) throw new PageNotFoundError(this.currentUrl)
        const [route] = rec
        const facade = this.facades.get(route)
        if (!facade) throw new PageNotFoundError(this.currentUrl)

        return facade as UnionOf<AllRoutes<C>>
    }
}

const routesC = route.config({
    search: route({
        schema: {
            controller: schema.num,
            action: schema.num.opt,
            id: schema.str,
        },
        pattern: p => `/${p.action}/${p.id}/qwe`,
    }),
    offer: route({
        schema: {
            id: schema.str,
        },
        pattern: p => `/offer/${p.id}`,
    }),
})

const router = new RouterSusanin({
    location: window.location,
    refresh: () => {},
    routes: routesC,
})

const c = router.current

if (c.name === 'search') {
    c.params.id
}

router.routes.search.params.id
