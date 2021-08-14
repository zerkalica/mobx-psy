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
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import webpackDevMiddleware from 'webpack-dev-middleware'

import { PsyContext } from '@psy/psy/context/Context'
import { psySsrMdlCombine } from '@psy/psy/ssr/mdlCombine'
import { PsySsrTemplate } from '@psy/psy/ssr/Template'

import { acmeBuildAssetMdl } from './assetMdl'
import { AcmeBuildAssetPlugin } from './AssetPlugin'

export class AcmeBuildBundler {
  constructor(protected $ = PsyContext.instance) {}

  protected isDevOverrided = false

  isDev() {
    if (this.isDevOverrided) return this.isDevOverrided

    return process.env.NODE_ENV === 'development'
  }

  noWatch() {
    return process.env.WP_NO_WATCH === '1'
  }

  analyzer() {
    return process.env.WP_ANALYZER === '1'
  }

  pkgName() {
    return ''
  }

  distRoot() {
    return ''
  }

  publicUrl() {
    return ''
  }

  protected versionCached: string | undefined = undefined

  getVersion() {
    return child_process.execSync('git rev-parse --short HEAD').toString().trim()
  }

  version() {
    return this.versionCached ?? (this.versionCached = this.getVersion())
  }

  outDir() {
    return path.join(this.distRoot(), 'public')
  }

  protected browserEntry() {
    return path.join(this.distRoot(), 'browser')
  }

  manifestName() {
    return 'manifest.json'
  }

  protected manifestPath() {
    return path.join(this.outDir(), this.manifestName())
  }

  protected wpc(): webpack.Configuration {
    const isDev = this.isDev()
    const outDir = this.outDir()
    const browserEntry = this.browserEntry()
    const pkgName = this.pkgName()

    return {
      name: path.basename(browserEntry),
      entry: {
        [pkgName]: browserEntry,
      },
      // optimization: {
      //   splitChunks: {
      //     filename: isDev ? `${pkgName}-[id].js` : `${pkgName}-[id]-[contenthash].js`,
      //     chunks: 'all',
      //   },
      // },
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
      module: {
        rules: this.rules().filter((rule): rule is NonNullable<typeof rule> => Boolean(rule)),
      },
      plugins: this.plugins().filter((plug): plug is NonNullable<typeof plug> => Boolean(plug)),
      output: {
        filename: isDev ? `[name].js` : `[name]-[contenthash].js`,
        path: outDir,
      },
    }
  }

  protected rules(): readonly (webpack.RuleSetRule | undefined)[] {
    return [this.ruleSourceMap()]
  }

  protected ruleSourceMap(): webpack.RuleSetRule | undefined {
    return {
      test: /\.js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
    }
  }

  protected plugins(): readonly (webpack.WebpackPluginInstance | undefined)[] {
    return [
      this.plugClean(),
      this.plugCircular(),
      this.plugAcmeAsset(),
      this.plugIgnore(),
      this.plugAnalyzer(),
      // new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
      this.plugProgress(),
      this.plugCopyWebpack(),
    ]
  }

  protected plugClean() {
    return new CleanWebpackPlugin() as CleanWebpackPlugin | undefined
  }

  protected plugIgnore() {
    return new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/tsbuildinfo$/,
    }) as webpack.IgnorePlugin | undefined
  }

  protected plugCircular() {
    return new CircularDependencyPlugin({
      failOnError: true,
    }) as webpack.WebpackPluginInstance | undefined
  }

  protected plugAcmeAsset() {
    return new AcmeBuildAssetPlugin({ meta: { version: this.version() }, filename: this.manifestName() }) as
      | AcmeBuildAssetPlugin
      | undefined
  }

  protected plugAnalyzer() {
    return this.analyzer() ? new BundleAnalyzerPlugin() : undefined
  }

  protected plugProgress() {
    return new webpack.ProgressPlugin() as webpack.ProgressPlugin | undefined
  }

  protected plugCopyWebpack() {
    return new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*.{png,jpg,svg,gif,woff2}',
          to: this.isDev() ? '[name][ext]' : '[name]-[contenthash][ext]',
          globOptions: {
            ignore: ['**/-'],
          },
        },
      ],
    }) as webpack.WebpackPluginInstance | undefined
  }

  protected log(obj: Object | string) {
    console.log(obj)
    // this.$.get(PsyLog).debug({
    //   place: 'AcmeBuildBundler',
    //   message: obj
    // })
  }

  protected compiler() {
    const outDir = this.outDir()
    const browserEntry = this.browserEntry()
    const pkgName = this.pkgName()
    const version = this.version()

    const compiler = webpack(this.wpc())
    const run = promisify(compiler.run.bind(compiler))
    this.log({ browserEntry, outDir, pkgName, version })

    return { compiler, run }
  }

  async manifest() {
    const { run } = this.compiler()

    const stats = await run()

    if (!stats) throw new Error('No stats')
    this.log(stats.toString({ colors: true }))

    return AcmeBuildAssetPlugin.info(stats.compilation)
  }

  protected template() {
    return new PsySsrTemplate()
  }

  async bundle() {
    this.tests()
    const manifest = await this.manifest()

    const t = this.template()

    if (!t) return manifest

    t.pkgName = () => this.pkgName()
    t.version = () => this.version()

    const prevBodyJs = t.bodyJs.bind(t)
    t.bodyJs = () => [...prevBodyJs(), ...Object.values(manifest.entries).map(src => ({ src: this.publicUrl() + src }))]

    await fs.writeFile(path.join(this.outDir(), t.fileName()), t.render({ __files: manifest.files }))

    return manifest
  }

  tests() {
    const p = child_process.spawnSync('jest', ['--passWithNoTests'], {
      stdio: 'inherit',
    })
    if (p.status) throw p.error ?? new Error(`Jest returns ${p.status}${p.stderr ? `: ${p.stderr}` : ''}`)
  }

  middleware() {
    this.isDevOverrided = true
    const { compiler } = this.compiler()

    const mdl = webpackDevMiddleware(compiler, {
      serverSideRender: true,
    })

    mdl.close()

    if (this.noWatch()) this.tests()
    else this.watch(mdl.invalidate.bind(mdl))

    return psySsrMdlCombine(mdl, acmeBuildAssetMdl({ version: this.version() }))
  }

  protected watch(invalidate: () => void) {
    const tswc = new TscWatchClient()
    tswc.on('success', () => {
      try {
        this.tests()
        invalidate()
      } catch (e) {
        console.error(e)
      }
    })
    tswc.on('compile_errors', invalidate)
    tswc.start('--noClear', '--build', '.')
  }
}
