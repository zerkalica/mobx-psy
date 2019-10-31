// @ts-ignore
import TscWatchClient from 'tsc-watch/client'
import { makeAssets } from './makeAssets'

// "watch": "tsc-watch --build --onFirstSuccess 'node dist/app/dev/server' --onSuccess 'mobx-psy-scripts-assets'"

export function watch(
  props: { server: string } & Parameters<typeof makeAssets>[0]
) {
  const client = new TscWatchClient()
  client.on('success', () => {
    console.log(`Making assets in ${props.build}`)
    makeAssets(props)
  })
  client.start('--build', `--onFirstSuccess 'node ${props.server}'`)
}
