import { promises as fs } from 'fs'
import path from 'path'

import { PsyContext } from '@psy/psy/context/Context'
import { psyErrorThrowHidden } from '@psy/psy/error/hidden'
import { psyErrorNormalize } from '@psy/psy/error/normalize'

export const AcmeServerManifest = {
  entries: {} as Record<string, string>,
  files: {} as Record<string, string>,
  version: 'dev-middleware',
  isDev: false,
}

export class AcmeServerManifestLoader {
  protected static cache = new Map<string, typeof AcmeServerManifest>()

  constructor(protected $ = PsyContext.instance) {}

  cache() {
    return AcmeServerManifestLoader.cache
  }

  outDir() {
    return ''
  }

  manifestFile() {
    return 'manifest.json'
  }

  async load() {
    const outDir = this.outDir()
    const manifestFileName = this.manifestFile()
    const cache = this.cache()
    let manifest = this.$.get(AcmeServerManifest)

    if (manifest !== AcmeServerManifest) return manifest

    const manifestFile = path.join(outDir, manifestFileName)
    let cached = cache.get(manifestFile)

    if (cached !== undefined) return cached

    let isExists = false

    try {
      isExists = (await fs.stat(manifestFile)).isFile()
    } catch (e) {}

    try {
      const manifestBuf = !isExists ? undefined : await fs.readFile(manifestFile)

      cached = !manifestBuf ? undefined : (JSON.parse(manifestBuf.toString()) as typeof AcmeServerManifest)
      if (!cached) throw new Error(`No manifest found`)
    } catch (e) {
      const err = psyErrorNormalize(e)
      err.message += ` ${manifestFile}`

      return psyErrorThrowHidden(err)
    }

    if (cache.size > 1000) cache.clear()

    cache.set(manifestFile, cached)

    return cached
  }
}
