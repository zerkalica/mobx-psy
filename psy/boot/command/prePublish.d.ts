import { Argv } from 'yargs';
import { CommandContext } from './context';
export declare function commandPrePublish({ resourcesMask, srcDir, outDir, pkgPath }: CommandContext & {
    resourcesMask: string;
}): Promise<void>;
export declare const commandPrePublishYargs: {
    command: string;
    describe: string;
    handler: typeof commandPrePublish;
    builder: <V extends Pick<{
        lib: boolean;
        projectDir: string;
        outDir: string;
        srcDir: string;
        pkg: Partial<import("../info/pkg").PsyBootInfoPkg>;
        pkgPath: string | undefined;
    }, "srcDir" | "outDir" | "pkgPath" | "lib" | "projectDir">>(y: Argv<V>) => Argv<V & {
        resourcesMask: string;
    }>;
};
