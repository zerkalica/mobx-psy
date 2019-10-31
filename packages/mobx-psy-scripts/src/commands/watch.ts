// @ts-ignore
import TscWatchClient from 'tsc-watch/client'
import { makeAssets } from './makeAssets'
import path from 'path'

// "watch": "tsc-watch --build --onFirstSuccess 'node dist/app/dev/server' --onSuccess 'mobx-psy-scripts-assets'"

export async function watch(
  props: { dev: string } & Parameters<typeof makeAssets>[0]
) {
  const createAssets = async () => {
    if (lock) return
    console.log(`Making assets in ${props.build}`)
    lock = true
    try {
        await makeAssets(props)
    } finally {
        lock = false
    }
  }
  await createAssets()
  const client = new TscWatchClient()
  let lock = false
  client.on('success', createAssets)
  console.log(`Running ${props.dev}`)
  client.start('--build', `--onFirstSuccess`, `node ${props.dev}`)
}
