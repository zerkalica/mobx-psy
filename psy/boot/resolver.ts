// @ts-ignore
import eh from 'enhanced-resolve'

const enhancedResolver = eh.create.sync({
  conditionNames: ['require', 'node', 'default', 'import'],
  extensions: ['.js', '.json', '.node', '.ts'],
})

function nodeResolver(request: (path: string) => unknown, options: { basedir: string }) {
  return enhancedResolver(options.basedir, request)
}

export = nodeResolver
