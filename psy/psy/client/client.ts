export const psyClient = {
  [Symbol.toStringTag]: 'psyClient',
  location: {
    search: '',
    origin: '',
    href: '',
    pathname: '',
    port: '',
    hostname: '',
  },
  navigator: {
    userAgent: 'raw',
  },
  history: {
    state: undefined as undefined | unknown,
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
