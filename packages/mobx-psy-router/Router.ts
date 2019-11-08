import { RouteConfig, AllRoutesConfig, UnionOf, AllRoutes, Route, RawParamsType } from './RouteType'
import { ParamsFromSchema } from './SchemaType'

export interface HistoryLike {
    pushState(data: any, title: string, url?: string | null): void
    replaceState(data: any, title: string, url?: string | null): void
}

export interface LocationLike {
    search: string
    origin: string
    pathname: string
    port: string
    hostname: string
}

export interface LocationStoreOptions {
    location?: LocationLike
    refresh?: () => void
    history?: HistoryLike
    target?: Window
}

export class PageNotFoundError extends Error {
    constructor(url: string) {
        super(`Page not found for "${url}"`)
    }
}

export interface RouterOptions<C extends AllRoutesConfig> extends LocationStoreOptions {
    routes: C
}

const defaultLocation: LocationLike = {
    search: '',
    origin: '',
    pathname: '',
    port: '',
    hostname: '',
}

export abstract class Router<C extends AllRoutesConfig> {
    protected location: LocationLike
    protected refresh: () => void
    protected history?: HistoryLike
    protected target?: Window

    protected routerConf: C

    constructor({
        location = defaultLocation,
        refresh = empty,
        history,
        target,
        routes,
    }: RouterOptions<C>) {
        this.location = location
        this.refresh = refresh
        this.history = history
        this.target = target
        this.routerConf = routes
        if (target) target.addEventListener('popstate', this.onPopState)
    }

    private _routes: AllRoutes<C> | undefined = undefined

    get routes(): AllRoutes<C> {
        if (this._routes) return this._routes

        const { routerConf } = this
        const keys = Object.keys(routerConf)
        const routes = {} as Record<string, Route>
        for (let key of keys) {
            const routeParams = routerConf[key]
            const route = this.createRoute(routeParams, key)
            routes[key] = route
        }
        this._routes = routes as AllRoutes<C>

        return this._routes
    }

    protected abstract createRoute<
        Schema,
        Data,
        Params,
        Defaults extends Partial<Params>,
        Name extends string
    >(
        config: RouteConfig<Schema, Data, Defaults>,
        name: Name
    ): Route<Params, Data, Defaults, Name>

    destructor() {
        const target = this.target
        if (target) target.removeEventListener('popstate', this.onPopState)
    }

    private onPopState = () => {
        this.refresh()
    }

    private nextUrl: string | undefined = undefined

    get currentUrl(): string {
        return this.nextUrl === undefined
            ? this.location.pathname + this.location.search
            : this.nextUrl
    }

    abstract get current(): UnionOf<AllRoutes<C>>

    update(nextUrl: string, replace: boolean = false) {
        this.nextUrl = nextUrl
        if (this.history) {
            if (replace) this.history.replaceState(null, '', this.currentUrl)
            else this.history.pushState(null, '', this.currentUrl)
        }
        this.refresh()
    }
}

function empty() {}
