import yargs from 'yargs';
import { commandPrePublishYargs } from './prePublish';
import { commandCleanYargs } from './clean';
export declare function command(): Promise<void>;
export declare type Config = Partial<Parameters<typeof commandPrePublishYargs['handler']>[0] & Parameters<typeof commandCleanYargs['handler']>[0]>;
export declare function commandYargs(): Promise<yargs.Argv<Pick<{
    lib: boolean;
    projectDir: string;
    outDir: string;
    srcDir: string;
    pkg: Partial<import("..").PsyBootInfoPkg>;
    pkgPath: string | undefined;
}, "srcDir" | "outDir" | "pkgPath" | "lib" | "projectDir">>>;
