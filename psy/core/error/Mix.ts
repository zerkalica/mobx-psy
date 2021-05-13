export class PsyErrorMix extends Error {
  constructor(message: string, readonly errors?: readonly Error[]) {
    super(message)

    if (errors?.length) {
      const stacks = [...errors.map(error => error.message), this.stack]

      const diff = diffPath(
        ...stacks.map(stack => {
          if (!stack) return []
          return stack.split('\n').reverse()
        })
      )

      const head = diff.prefix.reverse().join('\n')
      const tails = diff.suffix
        .map(path =>
          path
            .reverse()
            .map(line => line.replace(/^(?!\s+at)/, '\tat (.) '))
            .join('\n')
        )
        .join('\n\tat (.) -----\n')

      this.stack = `Error: ${this.constructor.name}\n\tat (.) /"""\\\n${tails}\n\tat (.) \\___/\n${head}`
      this.message += errors.map(error => '\n' + error.message).join('')
    }
  }

  toJSON() {
    return this.message
  }
}

function diffPath<Item>(...paths: Item[][]) {
  const limit = Math.min(...paths.map(path => path.length))

  lookup: for (var i = 0; i < limit; ++i) {
    const first = paths[0][i]

    for (let j = 1; j < paths.length; ++j) {
      if (paths[j][i] !== first) break lookup
    }
  }

  return {
    prefix: paths[0].slice(0, i),
    suffix: paths.map(path => path.slice(i)),
  }
}
