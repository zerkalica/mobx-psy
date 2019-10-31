import util from 'util'
import rimrafRaw from 'rimraf'
const rimraf = util.promisify(rimrafRaw)

export async function clean({ remove }: {remove: string}) {
  await rimraf(remove)
}
