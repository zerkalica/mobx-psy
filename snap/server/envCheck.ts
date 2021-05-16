function snapServerEnvCheck() {
  const env = process.env.NODE_ENV ?? 'production'

  if (env !== 'development' && env !== 'production') throw new Error(`NODE_ENV only development or production, ${env} given`)

  process.env.NODE_ENV = env
}

snapServerEnvCheck()
