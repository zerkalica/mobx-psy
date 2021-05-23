export function snapServerMdlListen(p: { port: number }) {
  return function snapServerMdlListen$() {
    console.log(
      `Server listening on \x1b[42m\x1b[1mhttp://localhost:${p.port}\x1b[0m in \x1b[41m${process.env.NODE_ENV}\x1b[0m 🌎...`
    )
  }
}
