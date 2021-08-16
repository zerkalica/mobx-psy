import webpack from 'webpack'

import { AcmeServerManifest } from '@acme/server/Manifest'
import { psyContextProvideMdlNode } from '@psy/psy/context/provide.node'

import { AcmeBuildAssetPlugin } from './AssetPlugin'

export function acmeBuildAssetMdl({ version }: { version: string }) {
  return psyContextProvideMdlNode(async function acmeBuildAssetMdl$(
    req,
    res: Object & {
      locals?: {
        webpack?: { devMiddleware?: { stats: webpack.Stats; outputFileSystem: webpack.Compiler['outputFileSystem'] } }
      }
    },
    $
  ) {
    const compilation = res.locals?.webpack?.devMiddleware?.stats.compilation

    if (!compilation) {
      throw new Error('acmeBuildAssetMdl: compilation not found in res.locals.webpack.devMiddleware.stats.compilation')
    }

    return $.set(AcmeServerManifest, {
      ...AcmeServerManifest,
      isDev: true,
      version,
      ...AcmeBuildAssetPlugin.info(compilation),
    })
  })
}
