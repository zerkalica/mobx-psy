import express from 'express'
import path from 'path'
// @ts-ignore
import TscWatchClient from 'tsc-watch/client'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'

import { snapBuildContext } from './context'

export interface SnapBuildBundler {
  bundle(): Promise<any>
  middleware(): express.RequestHandler
}

export function snapBuildBundler({
  distRoot,
  publicUrl,
  minify = false,
  noWatch = false,
}: {
  noWatch?: boolean
  distRoot: string
  publicUrl: string
  minify?: boolean
}) {
  const { outDir, browserEntry, srcRoot } = snapBuildContext({ distRoot, distEntry: true })
  const webpackConfig: webpack.Configuration = {
    entry: browserEntry,
    devtool: 'source-map',
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    stats: 'normal',
    optimization: {
      minimize: minify,
    },
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
      // new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
      // new webpack.ProgressPlugin(),
    ],
    output: {
      filename: path.basename(browserEntry).replace(/\.tsx$/, '.js'),
      path: outDir,
    },
  }

  console.log({ browserEntry, srcRoot, outDir })

  const bundler: SnapBuildBundler = {
    bundle() {
      const compiler = webpack(webpackConfig)

      return new Promise<void>((resolve, reject) => {
        compiler.run((error, stats) => {
          if (error || stats?.hasErrors()) {
            console.error(stats?.toString({ colors: true }))
            reject(error)
            return
          }

          console.log(stats?.toString({ colors: true }))
          // stats.hash
          resolve()
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
