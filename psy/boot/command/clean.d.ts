import { Argv } from 'yargs';
export declare function commandClean({ cleanMask, projectDir, }: {
    cleanMask: string;
    projectDir: string;
}): Promise<void>;
export declare const commandCleanYargs: {
    command: string;
    describe: string;
    handler: typeof commandClean;
    builder: <V extends Pick<{
        lib: boolean;
        projectDir: string;
        outDir: string;
        srcDir: string;
        pkg: Partial<import("..").PsyBootInfoPkg>;
        pkgPath: string | undefined;
    }, "srcDir" | "outDir" | "pkgPath" | "lib" | "projectDir">>(y: Argv<V>) => Argv<V & {
        cleanMask: string;
    }>;
};
