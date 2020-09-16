import findUp from 'find-up'
import {readFileSync, promises as fs} from 'fs'

export interface InfoPkg {
  name: string
  version: string
  private?: boolean
  workspaces?: string[]
  main: string
  module?: string
  browser?: string
  typings?: string
  // @see https://github.com/parcel-bundler/parcel/blob/master/PARCEL_2_RFC.md#packagejsonsource
  source?: string[] | string
}

export async function infoPkg(pkgPath?: string) {
  pkgPath = pkgPath ?? (await findUp('package.json'))

  const packageJsonData = await (pkgPath
    ? fs.readFile(pkgPath)
    : '')

  const pkg: Partial<InfoPkg> = packageJsonData
    ? JSON.parse(packageJsonData.toString())
    : {}

  return {pkg, pkgPath}
}

export function infoPkgSync(pkgPath?: string) {
  pkgPath = pkgPath ?? findUp.sync('package.json')

  const packageJsonData = (pkgPath
    ? readFileSync(pkgPath)
    : '')

  const pkg: Partial<InfoPkg> = packageJsonData
    ? JSON.parse(packageJsonData.toString())
    : {}

  return {pkg, pkgPath}
}
