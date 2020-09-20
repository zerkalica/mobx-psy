import path from 'path'
import { pathsToModuleNameMapper } from 'ts-jest/utils'
import { psyBootInfoPkgSync } from './info/pkg'

import { psyBootInfoTsConfig } from './info/tsConfig'

export function jestConfig(
  pkgDir: string,
  {
    useYarnWorkspaces = false,
    tsConfigJson = 'tsconfig.json',
  }: {
    useYarnWorkspaces?: boolean
    tsConfigJson?: string
  } = {}
) {
  const {
    options: { rootDir, baseUrl, paths },
  } = psyBootInfoTsConfig(path.join(pkgDir, tsConfigJson))

  const pkg = useYarnWorkspaces ? psyBootInfoPkgSync(path.join(pkgDir, 'package.json')).pkg : undefined

  const config = {
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testEnvironment: 'node',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testPathIgnorePatterns: [
      '/-/'
    ],
    // rootDir: pkgDir,
    projects: pkg?.workspaces?.map((prj) => `<rootDir>/${prj}`),
    moduleNameMapper: paths
      ? pathsToModuleNameMapper(paths, {
          prefix: `${baseUrl}/`,
        })
      : undefined,
    testMatch: [
      `${rootDir}/**/__tests__/**/*@(spec|test).@(js|ts)?(x)`
    ],
  }

  return config
}
