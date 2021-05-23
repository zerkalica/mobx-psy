import child_process from 'child_process'
// @ts-ignore
import CircularDependencyPlugin from 'circular-dependency-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
// @ts-ignore
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { promises as fs } from 'fs'
import path from 'path'
// @ts-ignore
import TscWatchClient from 'tsc-watch/client'
import { promisify } from 'util'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'

import { psyContextProvideNodeMdl } from '@psy/core/context/provide.node'
import { psySsrMdlCombine } from '@psy/core/ssr/mdlCombine'
import { PsySsrTemplate } from '@psy/core/ssr/Template'
import { SnapServerManifest } from '@snap/server/Manifest'

import { AcmeSnapBuildAssetPlugin, acmeSnapBuildAssetPluginAssets } from './AssetPlugin'

export class SnapBuildBundler {
  constructor(
    opts: {
      version?: string
      pkgName: string
      noWatch?: boolean
      distRoot: string
      publicUrl: string
      template?: PsySsrTemplate
    },
    protected pkgName = opts.pkgName,
    protected noWatch = opts.noWatch ?? process.env.PSY_NO_WATCH === '1',
    protected distRoot = opts.distRoot,
    protected publicUrl = opts.publicUrl,
    protected template = opts.template
  ) {}

  protected versionCached: string | undefined = undefined

  getVersion() {
    return child_process.execSync('git rev-parse --short HEAD').toString().trim()
  }

  get version() {
    return this.versionCached ?? (this.versionCached = this.getVersion())
  }

  get outDir() {
    return path.join(this.distRoot, 'public')
  }

  protected get browserEntry() {
    return path.join(this.distRoot, 'browser')
  }

  get manifestName() {
    return 'manifest.json'
  }

  protected get manifest() {
    return path.join(this.outDir, this.manifestName)
  }

  protected wpc(isDev: boolean): webpack.Configuration {
    const { outDir, browserEntry, pkgName, version } = this

    return {
      name: path.basename(browserEntry),
      entry: {
        [pkgName]: browserEntry,
      },
      optimization: {
        splitChunks: {
          filename: isDev ? `${pkgName}-[id].js` : `${pkgName}-[id]-[contenthash].js`,
          chunks: 'all',
        },
      },
      devtool: 'source-map',
      mode: isDev ? 'development' : 'production',
      stats: 'normal',
      performance: {
        maxAssetSize: 400000,
        maxEntrypointSize: 400000,
        assetFilter(name: string) {
          return name.endsWith('.js')
        },
      },
      plugins: [
        new CleanWebpackPlugin(),
        new CircularDependencyPlugin({
          failOnError: true,
        }),
        new AcmeSnapBuildAssetPlugin({ meta: { version }, filename: this.manifestName }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/tsbuildinfo$/,
        }),
        // new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
        new webpack.ProgressPlugin(),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: '**/*.{png,jpg,svg,gif,woff2}',
              to: isDev ? '[name][ext]' : '[name]-[contenthash][ext]',
              globOptions: {
                ignore: ['**/-'],
              },
            },
          ],
        }),
      ],
      output: {
        filename: isDev ? `[name].js` : `[name]-[contenthash].js`,
        path: outDir,
      },
    }
  }

  protected compiler(isDev = false) {
    const { outDir, browserEntry, pkgName, version } = this

    const compiler = webpack(this.wpc(isDev))
    const run = promisify(compiler.run.bind(compiler))

    console.log({ browserEntry, outDir, pkgName, version })

    return { compiler, run }
  }

  async bundle() {
    this.tests()

    const { run } = this.compiler()

    const stats = await run()

    if (!stats) throw new Error('No stats')
    console.log(stats.toString({ colors: true }))

    const manifest = acmeSnapBuildAssetPluginAssets(stats.compilation)

    const template = this.template

    if (!template) return manifest

    const t = Object.assign(new PsySsrTemplate(), template)
    t.pkgName = () => this.pkgName
    t.version = () => this.version
    t.bodyJs = () => [...t.bodyJs(), ...Object.values(manifest.entries).map(src => ({ src: this.publicUrl + src }))]

    await fs.writeFile(path.join(this.outDir, 'index.html'), template.render({ __files: manifest.files }))

    return manifest
  }

  tests() {
    const p = child_process.spawnSync('jest', ['--passWithNoTests'], {
      stdio: 'inherit',
    })
    if (p.status) throw p.error ?? new Error(`Jest returns ${p.status}${p.stderr ? `: ${p.stderr}` : ''}`)
  }

  middleware() {
    const { version, noWatch } = this
    const { compiler } = this.compiler(true)

    if (noWatch) this.tests()

    const mdl = webpackDevMiddleware(compiler, {
      serverSideRender: true,
    })

    mdl.close()

    const combined = psySsrMdlCombine(mdl, snapBuildBundlerMdl({ version }))

    if (noWatch) return combined

    this.watch(mdl.invalidate.bind(mdl))
  }

  protected watch(invalidate: () => void) {
    const tswc = new TscWatchClient()
    tswc.on('success', () => {
      invalidate()
      this.tests()
    })
    tswc.on('compile_errors', invalidate)
    tswc.start('--build', '.')
  }
}

function snapBuildBundlerMdl({ version }: { version: string }) {
  return psyContextProvideNodeMdl(async function snapBuildBundlerMdl$(
    $,
    req,
    res: Object & {
      locals?: {
        webpack?: { devMiddleware?: { stats: webpack.Stats; outputFileSystem: webpack.Compiler['outputFileSystem'] } }
      }
    }
  ) {
    const compilation = res.locals?.webpack?.devMiddleware?.stats.compilation

    if (!compilation) {
      throw new Error('snapBuildBundlerMdl: compilation not found in res.locals.webpack.devMiddleware.stats.compilation')
    }

    return $.set(SnapServerManifest, {
      ...SnapServerManifest,
      version,
      ...acmeSnapBuildAssetPluginAssets(compilation),
    })
  })
}
