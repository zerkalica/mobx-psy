import { promises as fsReal } from 'fs'
import path from 'path'
import { callbackify, promisify } from 'util'
import webpack from 'webpack'

export function snapBuildAssetPluginAssets(compilation: webpack.Compilation) {
  const files = {} as Record<string, string>
  const entries = {} as Record<string, string>

  for (const [k, v] of compilation.assetsInfo) {
    if (v.sourceFilename) files[v.sourceFilename] = k
  }

  compilation.entrypoints.forEach((p, k) => {
    entries[k] = Array.from(p.getEntrypointChunk().files)?.[0]
  })

  return {
    files,
    entries,
  }
}

export class SnapBuildAssetPlugin {
  constructor(
    protected opts: {
      meta?: Record<string, any>
      pretty?: boolean
      filename?: string
    } = {}
  ) {}

  apply(compiler: webpack.Compiler) {
    compiler.hooks.emit.tapAsync({ name: 'AcmeSnapBuildAssetPlugin' }, callbackify(this.emit.bind(this)))
  }

  async emit(compilation: webpack.Compilation) {
    const out = snapBuildAssetPluginAssets(compilation)

    const fs = compilation.compiler.outputFileSystem as typeof compilation.compiler.outputFileSystem & {
      mkdirp?(p: string, cb: (err?: unknown) => void): void
    }

    const mkdir = fs.mkdirp ? promisify(fs.mkdirp.bind(fs)) : (path: string) => fsReal.mkdir(path, { recursive: true })
    const writeFile = promisify(fs.writeFile.bind(fs))
    const stat = promisify(fs.stat.bind(fs))
    const join = fs.join ?? path.join

    const outDir = compilation.outputOptions.path

    if (!outDir) throw new Error('No outputOptions.path in webpack compilation')

    const manifestFile = join(outDir, this.opts.filename ?? 'manifest.json')

    await mkdir(outDir)
    await writeFile(manifestFile, JSON.stringify({ ...out, ...this.opts.meta }, null, this.opts.pretty ? '  ' : ''))
  }
}
