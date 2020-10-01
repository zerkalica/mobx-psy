import * as ts_module from 'typescript/lib/tsserverlibrary'
import path from 'path'

function init(modules: { typescript: typeof ts_module }) {
  const ts = modules.typescript

  type LanguageServiceHost = ts.LanguageServiceHost & {
    getPackageJsonAutoImportProvider?(): ts.Program | undefined;
  }

  type PluginCreateInfo = ts.server.PluginCreateInfo & {
    languageServiceHost: LanguageServiceHost;
  }

  type TAutoImportProviderProject = ts.server.AutoImportProviderProject & {
    getRootFileNames(
      dependencySelection: ts.UserPreferences,
      hostProject: ts.server.Project,
      moduleResolutionHost: ts.ModuleResolutionHost,
      compilerOptions: ts.CompilerOptions
    ): string[]
  }

  const AutoImportProviderProject = ts.server.AutoImportProviderProject as unknown as TAutoImportProviderProject

  const getRootFileNames = AutoImportProviderProject.getRootFileNames

  AutoImportProviderProject.getRootFileNames = function getRootFileNamesFixed(
    dependencySelection: ts.UserPreferences,
    hostProject: ts.server.Project,
    moduleResolutionHost: ts.ModuleResolutionHost,
    compilerOptions: ts.CompilerOptions
  ) {

    const imports: string[] = getRootFileNames.call(this, dependencySelection, hostProject, moduleResolutionHost, compilerOptions)

    return imports

    // const result: string[] = []
    // for (const item of imports) {
    //   const isFixable = item.endsWith('/-/index.d.ts')
    //   if (isFixable) {
    //     const fixed = item.replace('/-/index.d.ts', '/index.ts')

    //     debugger
    //     const dirs = moduleResolutionHost?.getDirectories ? moduleResolutionHost.getDirectories(path.dirname(fixed)) : []

    //     for (const dir of dirs) result.push(dir)
    //     result.push(fixed)

    //   } else {
    //     result.push(item)
    //   }
    // }

    // return result
  }

  function create(info: PluginCreateInfo) {
    info.project.projectService.logger.info('ts-plugin-autoimport-fix::start')

    // Set up decorator
    const proxy: ts.LanguageService = Object.create(null);
    for (let k of Object.keys(info.languageService) as Array<
      keyof ts.LanguageService
    >) {
      const x = info.languageService[k] as any

      proxy[k] = (...args: any[]) => x.apply(info.languageService, args)
    }

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      info.project.projectService.logger.info('ts-plugin-autoimport-fix::get')
      const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
      // info.project.projectService.logger.info(JSON.stringify(prior.entries));
      // debugger;
      return prior;
  };

    return proxy
  }

  return { create }
}

export = init
