export const snapRouterClient = {
  [Symbol.toStringTag]: 'snapRouterClient',
  location: {
    search: '',
    origin: '',
    pathname: '',
    port: '',
    hostname: '',
  },
  history: {
    pushState(data: any, title: string, url?: string | null): void {
      throw new Error('implement')
    },
    replaceState(data: any, title: string, url?: string | null): void {
      throw new Error('implement')
    },
  },
  addEventListener(event: string, cb: () => unknown) {},
  removeEventListener(event: string, cb: () => unknown) {},
}
