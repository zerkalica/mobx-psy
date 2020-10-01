import express from 'express'
import path from 'path'
import webpack from 'webpack'
// @ts-ignore
import webpackDevMiddleware from 'webpack-dev-middleware'

import { demoLibBuildContext } from './context'

export interface DemoLibBuildBundler {
  bundle(): Promise<any>
  middleware(): express.RequestHandler
}

export function demoLibBuildBundler({
  distRoot,
  publicUrl,
  minify = false,
}: {
  distRoot: string
  publicUrl: string
  minify?: boolean
}) {
  const { outDir, browserEntry, srcRoot } = demoLibBuildContext({ distRoot, distEntry: true })
  // const alias = psyBootInfoWorkspacesSync(srcRoot)?.reduce(
  //   (acc, p) => ({
  //     ...acc,
  //     [`${p.pkg.name}$`]: `${p.pkg.name}/index`
  //   }),
  //   {} as Record<string, string>
  // )

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
    // module: {
    //   rules: [
    //     {
    //       test: /.tsx?$/,
    //       use: [
    //         {
    //           loader: 'ts-loader',
    //           options: {
    //             configFile: 'tsconfig.json',
    //             projectReferences: true,
    //           },
    //         },
    //       ],
    //       exclude: /node_modules/,
    //     },
    //   ],
    // },
    plugins: [
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/tsbuildinfo$/,
      }),
      // new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
      // new webpack.ProgressPlugin(),
    ],
    resolve: {
      symlinks: false,
      // fullySpecified: true
      // exportsFields: ['exports'],
      // extensions: ['.tsx', '.ts', '.js'],
      // extensions: ['.js'],
    },
    output: {
      filename: path.basename(browserEntry).replace(/\.tsx$/, '.js'),
      path: outDir,
    },
  }

  console.log({ browserEntry, srcRoot, outDir })

  const bundler: DemoLibBuildBundler = {
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

      return webpackDevMiddleware(compiler, {
        publicPath: publicUrl
      })
    },
  }

  return bundler
}
