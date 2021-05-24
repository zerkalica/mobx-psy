import { promises as fs } from 'fs'
import path from 'path'

import { psyErrorThrowHidden } from '@psy/core/error/hidden'
import { psyErrorNormalize } from '@psy/core/error/normalize'

export const SnapServerManifest = {
  entries: {} as Record<string, string>,
  files: {} as Record<string, string>,
  version: 'dev-middleware',
  isDev: false,
}

export class SnapServerManifestLoader {
  protected cache = new Map<string, typeof SnapServerManifest>()

  async load({ outDir, manifestFileName = 'manifest.json' }: { outDir: string; manifestFileName?: string }) {
    const manifestFile = path.join(outDir, manifestFileName)
    let manifest = this.cache.get(manifestFile)

    if (!manifest) {
      let isExists = false

      try {
        isExists = (await fs.stat(manifestFile)).isFile()
      } catch (e) {}

      try {
        const manifestBuf = !isExists ? undefined : await fs.readFile(manifestFile)

        manifest = !manifestBuf ? undefined : (JSON.parse(manifestBuf.toString()) as typeof SnapServerManifest)
        if (!manifest) throw new Error(`No manifest found`)
      } catch (e) {
        const err = psyErrorNormalize(e)
        err.message += ` ${manifestFile}`

        return psyErrorThrowHidden(err)
      }

      if (this.cache.size > 1000) this.cache.clear()

      this.cache.set(manifestFile, manifest)
    }

    return manifest
  }
}
