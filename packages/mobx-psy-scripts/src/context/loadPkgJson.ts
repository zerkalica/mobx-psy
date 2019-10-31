import findUp from 'find-up'
import fs from 'fs'

export interface Pkg {
  name: string
  version: string
  private?: boolean
  // @see https://github.com/parcel-bundler/parcel/blob/master/PARCEL_2_RFC.md#packagejsonsource
  source?: string[] | string
}

export async function loadPkgJson() {
  const pkgPath = await findUp('package.json')

  const packageJsonData = await (pkgPath
    ? fs.promises.readFile(pkgPath)
    : '')

  const pkg: Partial<Pkg> = packageJsonData
    ? JSON.parse(packageJsonData.toString())
    : {}

  return {pkg, pkgPath}
}
