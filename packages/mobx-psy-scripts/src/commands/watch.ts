import path from 'path'
// @ts-ignore
import TscWatchClient from 'tsc-watch/client'

import { ContextOptions } from '../addContextOptions'
import { distDir } from './build'
import { makeAssets } from './makeAssets'

// "watch": "tsc-watch --build --onFirstSuccess 'node dist/app/dev/server' --onSuccess 'mobx-psy-scripts-assets'"

export const devServerPath = 'dist/app/dev/server'

export async function watch(props: ContextOptions) {
  let lock = false
  const createAssets = async () => {
    if (lock) return
    console.log(`Making assets in ${path.join(props.project, distDir)}`)
    lock = true
    try {
      await makeAssets(props)
    } finally {
      lock = false
    }
  }
  await createAssets()
  const client = new TscWatchClient()
  client.on('success', createAssets)
  const devServer = path.join(props.project, devServerPath)
  console.log(`Running ${devServer}`)
  if (props.lib) {
    client.start('--build')
  } else {
    client.start('--build', `--onFirstSuccess`, `node ${devServer}`)
  }
}

export const watchCommand = {
  command: 'watch',
  describe: 'Development watch server',
  handler: watch,
}
