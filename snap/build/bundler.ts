import express from 'express'
import path from 'path'
// @ts-ignore
import TscWatchClient from 'tsc-watch/client'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'

import { snapBuildContext } from './context'

export interface SnapBuildBundler {
  bundle(): Promise<{ indexHtml: string }>
  middleware(): express.RequestHandler
}

export function snapBuildBundler({
  distRoot,
  publicUrl,
  isDev = process.env.NODE_ENV === 'development',
  noWatch = process.env.PSY_NO_WATCH === '1',
}: {
  isDev?: boolean
  noWatch?: boolean
  distRoot: string
  publicUrl: string
}) {
  const { outDir, indexHtml, browserEntry, srcRoot } = snapBuildContext({ distRoot })
  const webpackConfig: webpack.Configuration = {
    name: path.basename(browserEntry),
    entry: browserEntry,
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
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/tsbuildinfo$/,
      }),
      new webpack.LibManifestPlugin({
        path: path.resolve(outDir, '[name]-manifest.json'),
        name: '[name]_[fullhash]',
      }),
      // new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
      // new webpack.ProgressPlugin(),
    ],
    output: {
      filename: isDev ? '[name].js' : '[name].[contenthash].bundle.js',
      path: outDir,
    },
  }

  console.log({ browserEntry, srcRoot, outDir })

  const bundler: SnapBuildBundler = {
    bundle() {
      const compiler = webpack(webpackConfig)

      return new Promise((resolve, reject) => {
        compiler.run((error, stats) => {
          if (error || stats?.hasErrors()) {
            console.error(stats?.toString({ colors: true }))
            reject(error)
            return
          }

          console.log(stats?.toString({ colors: true }))
          // stats.hash
          resolve({
            indexHtml,
          })
        })
      })
    },
    middleware() {
      const compiler = webpack({
        ...webpackConfig,
        mode: 'development',
      })

      const mdl = webpackDevMiddleware(compiler, {
        publicPath: publicUrl,
        serverSideRender: true,
      })

      mdl.close()
      if (noWatch) return mdl

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

      return mdl
    },
  }

  return bundler
}
