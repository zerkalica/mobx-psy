import webpack from 'webpack'

import { AcmeServerManifest } from '@acme/server/Manifest'
import { psyContextProvideNode } from '@psy/psy/context/provide.node'
import { psySsrMdlAsync } from '@psy/psy/ssr/mdlAsync'

import { AcmeBuildAssetPlugin } from './AssetPlugin'

export function acmeBuildAssetMdl({ version }: { version: string }) {
  return psySsrMdlAsync(async function acmeBuildAssetMdl$(
    req,
    res: Object & {
      locals?: {
        webpack?: { devMiddleware?: { stats: webpack.Stats; outputFileSystem: webpack.Compiler['outputFileSystem'] } }
      }
    },
    next
  ) {
    const compilation = res.locals?.webpack?.devMiddleware?.stats.compilation

    if (!compilation) {
      throw new Error('acmeBuildAssetMdl: compilation not found in res.locals.webpack.devMiddleware.stats.compilation')
    }

    psyContextProvideNode(next, $ => {
      return $.set(AcmeServerManifest, {
        ...AcmeServerManifest,
        isDev: true,
        version,
        ...AcmeBuildAssetPlugin.info(compilation),
      })
    })
  })
}
