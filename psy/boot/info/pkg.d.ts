export interface PsyBootInfoPkg {
    name: string;
    version: string;
    private?: boolean;
    workspaces?: string[];
    main: string;
    module?: string;
    browser?: string;
    typings?: string;
    source?: string[] | string;
}
export declare function psyBootInfoPkg(pkgPath?: string): Promise<{
    pkg: Partial<PsyBootInfoPkg>;
    pkgPath: string | undefined;
}>;
export declare function psyBootInfoPkgSync(pkgPath?: string): {
    pkg: Partial<PsyBootInfoPkg>;
    pkgPath: string | undefined;
};
