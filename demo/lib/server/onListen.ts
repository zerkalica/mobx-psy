export function demoLibServerOnListen({
  env = process.env.NODE_ENV,
  port
}: {
  env?: string
  port: number
}) {
  return () => {
    console.log(
      `Server listening on \x1b[42m\x1b[1mhttp://localhost:${port}\x1b[0m in \x1b[41m${env}\x1b[0m 🌎...`
    )
  }
}
