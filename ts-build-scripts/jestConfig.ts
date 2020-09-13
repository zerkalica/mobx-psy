import { infoTsConfig } from './info/tsConfig'
import path from 'path'
import { pathsToModuleNameMapper } from 'ts-jest/utils'

export function jestConfig(pkgDir: string, tsConfigJson = 'tsconfig.jest.json') {
  const {
    options: { rootDir, baseUrl, paths },
  } = infoTsConfig(path.join(pkgDir, tsConfigJson))

  return {
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    moduleNameMapper: paths
      ? pathsToModuleNameMapper(paths, {
          prefix: `${baseUrl}/`,
        })
      : undefined,
    // rootDir,
    testEnvironment: 'node',
    testURL: 'http://localhost',
    testMatch: [`${rootDir}/**/__tests__/**/*test.@(js|ts)?(x)`],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
  }
}
