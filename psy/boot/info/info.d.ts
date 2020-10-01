export declare function psyBootInfo(): Promise<{
    lib: boolean;
    projectDir: string;
    outDir: string;
    srcDir: string;
    pkg: Partial<import("./pkg").PsyBootInfoPkg>;
    pkgPath: string | undefined;
}>;
declare type PromiseValue<P> = P extends PromiseLike<infer V> ? V : never;
export declare type PsyBootInfo = PromiseValue<ReturnType<typeof psyBootInfo>>;
export {};
