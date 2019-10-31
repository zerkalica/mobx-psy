// @ts-ignore
import TscWatchClient from 'tsc-watch/client'
import { makeAssets } from './makeAssets'

// "watch": "tsc-watch --build --onFirstSuccess 'node dist/app/dev/server' --onSuccess 'mobx-psy-scripts-assets'"

export async function watch(
  props: { dev: string } & Parameters<typeof makeAssets>[0]
) {
  const client = new TscWatchClient()
  client.on('success', () => {
    console.log(`Making assets in ${props.build}`)
    makeAssets(props)
  })

  await makeAssets(props)

  client.start('--build', `--onFirstSuccess 'node ${props.dev}'`)
}
