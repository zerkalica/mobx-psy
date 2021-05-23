// @ts-ignore
import CircularDependencyPlugin from 'circular-dependency-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
// @ts-ignore
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { promises as fs } from 'fs'
import path, { sep } from 'path'
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
    protected version = opts.version ?? new Date().toISOString(),
    protected pkgName = opts.pkgName,
    protected noWatch = opts.noWatch ?? process.env.PSY_NO_WATCH === '1',
    protected distRoot = opts.distRoot,
    protected publicUrl = opts.publicUrl,
    protected template = opts.template
  ) {}

  get outDir() {
    return path.join(this.distRoot, 'public')
  }

  get srcRoot() {
    return this.distRoot.replace(`${sep}-${sep}`, `${sep}`)
  }

  get browserEntry() {
    return path.join(this.distRoot, 'browser')
  }

  get manifestName() {
    return 'manifest.json'
  }

  get manifest() {
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
    const { outDir, browserEntry, srcRoot, pkgName } = this

    const compiler = webpack(this.wpc(isDev))
    const run = promisify(compiler.run.bind(compiler))

    console.log({ browserEntry, srcRoot, outDir, pkgName })

    return { compiler, run }
  }

  async bundle() {
    const { run } = this.compiler()

    const stats = await run()

    if (!stats) throw new Error('No stats')
    console.log(stats.toString({ colors: true }))

    const manifest = acmeSnapBuildAssetPluginAssets(stats.compilation)

    const template = this.template

    if (!template) return manifest

    const t = Object.assign(new PsySsrTemplate(), template)
    t.pkgName = () => this.pkgName
    t.bodyJs = () => [...t.bodyJs(), ...Object.values(manifest.entries).map(src => ({ src: this.publicUrl + src }))]

    await fs.writeFile(path.join(this.outDir, 'index.html'), template.render({ __files: manifest.files }))

    return manifest
  }

  middleware() {
    const { noWatch } = this
    const { compiler } = this.compiler(true)

    const mdl = webpackDevMiddleware(compiler, {
      serverSideRender: true,
    })

    mdl.close()

    const combined = psySsrMdlCombine(mdl, snapBuildBundlerMdl())

    if (noWatch) return combined

    const c = new TscWatchClient()
    c.on('success', () => {
      console.log('invalidate')
      mdl.invalidate()
    })
    c.on('compile_errors', () => {
      console.error('error')
      mdl.invalidate()
    })
    c.start('--build', '.')
  }
}

function snapBuildBundlerMdl() {
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

    return $.set(SnapServerManifest, { ...SnapServerManifest, ...acmeSnapBuildAssetPluginAssets(compilation) })
  })
}
