import { loadTsConfig } from '../ts'
import path from 'path'
import { pathsToModuleNameMapper } from 'ts-jest/utils'

export function createJestConfig(pkgDir: string) {
  const {
    options: { rootDir, baseUrl, paths },
  } = loadTsConfig(path.join(pkgDir, 'tsconfig.json'))

  return {
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    moduleNameMapper: paths
      ? pathsToModuleNameMapper(paths, {
          prefix: `${baseUrl}/`,
        })
      : undefined,
    // rootDir,
    testURL: 'http://localhost',
    testMatch: [`${rootDir}/**/__tests__/**/*spec.@(js|ts)?(x)`],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
  }
}
