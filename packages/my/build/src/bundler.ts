import express from 'express'
import Bundler from 'parcel-bundler'

import { myBuildContext } from './context'

export interface MyBuildBundler {
  bundle(): Promise<any>
  middleware(): express.RequestHandler
}

export function myBuildBundler({
  publicUrl,
  minify = false,
  watch = false,
  scopeHoist = false,
  ...options
}: {
  scopeHoist?: boolean
  watch?: boolean
  publicUrl: string
  minify?: boolean
} & Parameters<typeof myBuildContext>[0]) {
  const { outDir, browserEntry } = myBuildContext(options)

  const bundlerOptions: ConstructorParameters<typeof Bundler>[1] = {
    outDir,
    publicUrl,
    scopeHoist,
    contentHash: false,
    watch,
    minify,
  }

  console.log({ browserEntry, ...bundlerOptions })

  const bundler: MyBuildBundler = new Bundler(browserEntry, bundlerOptions)

  return bundler
}
