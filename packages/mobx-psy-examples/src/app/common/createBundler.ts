import Bundler from 'parcel-bundler'
import path, {sep} from 'path'
import express from 'express'

interface GenericBundler {
  bundle(): Promise<any>
  middleware(): express.RequestHandler
}

export function createBundler({
  publicUrl,
  minify = false,
  distRoot,
  watch = false,
}: {
  watch?: boolean
  publicUrl: string
  minify?: boolean
  distRoot: string
}) {
  const outDir = path.join(distRoot, 'public')

  const srcRoot = distRoot.replace(`${sep}dist${sep}`, `${sep}src${sep}`)
  const browserEntry = path.join(srcRoot, 'browser.ts')

  const bundler: GenericBundler = new Bundler(browserEntry, {
    outDir,
    publicUrl,
    contentHash: false,
    watch,
    minify,
  })

  return bundler
}
