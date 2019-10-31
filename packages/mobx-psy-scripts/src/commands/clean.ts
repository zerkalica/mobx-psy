import util from 'util'
import rimrafRaw from 'rimraf'
const rimraf = util.promisify(rimrafRaw)

export async function clean({ remove }: {remove: string}) {
  console.log(`rimraf ${remove}`)
  const cmds = remove.split(',')
  await Promise.all(cmds.map(cmd => rimraf(cmd)))
}
