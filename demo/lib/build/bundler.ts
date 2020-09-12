import express from 'express'
import Bundler from 'parcel-bundler'

import { demoLibBuildContext } from './context'

export interface DemoLibBuildBundler {
  bundle(): Promise<any>
  middleware(): express.RequestHandler
}

export function demoLibBuildBundler({
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
} & Parameters<typeof demoLibBuildContext>[0]) {
  const { outDir, browserEntry } = demoLibBuildContext(options)

  const bundlerOptions: ConstructorParameters<typeof Bundler>[1] = {
    outDir,
    publicUrl,
    scopeHoist,
    contentHash: false,
    watch,
    minify,
  }

  console.log({ browserEntry, ...bundlerOptions })

  const bundler: DemoLibBuildBundler = new Bundler(browserEntry, bundlerOptions)

  return bundler
}
